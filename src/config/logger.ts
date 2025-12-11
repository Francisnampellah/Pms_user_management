import pino, { Logger, DestinationStream } from 'pino';
import net from 'net';

// Environment configuration
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOGSTASH_HOST = process.env.LOGSTASH_HOST || 'localhost';
const LOGSTASH_PORT = parseInt(process.env.LOGSTASH_PORT || '5000', 10);
const ENABLE_ELK_LOGGING = process.env.ENABLE_ELK_LOGGING === 'true';

// Custom TCP stream for Logstash
class LogstashStream {
  private socket: net.Socket | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private buffer: string[] = [];
  private connected = false;
  private readonly maxBufferSize = 1000;

  constructor(
    private host: string,
    private port: number
  ) {
    this.connect();
  }

  private connect(): void {
    if (this.socket) {
      this.socket.destroy();
    }

    this.socket = new net.Socket();
    
    this.socket.connect(this.port, this.host, () => {
      this.connected = true;
      console.log(`[Logger] Connected to Logstash at ${this.host}:${this.port}`);
      
      // Flush buffered logs
      while (this.buffer.length > 0) {
        const log = this.buffer.shift();
        if (log) {
          this.socket?.write(log + '\n');
        }
      }
    });

    this.socket.on('error', (err) => {
      console.error(`[Logger] Logstash connection error: ${err.message}`);
      this.connected = false;
      this.scheduleReconnect();
    });

    this.socket.on('close', () => {
      this.connected = false;
      this.scheduleReconnect();
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectInterval) return;
    
    this.reconnectInterval = setTimeout(() => {
      this.reconnectInterval = null;
      console.log('[Logger] Attempting to reconnect to Logstash...');
      this.connect();
    }, 5000);
  }

  write(data: string): void {
    if (this.connected && this.socket) {
      this.socket.write(data + '\n');
    } else {
      // Buffer logs when disconnected
      if (this.buffer.length < this.maxBufferSize) {
        this.buffer.push(data);
      }
    }
  }

  destroy(): void {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
    }
    if (this.socket) {
      this.socket.destroy();
    }
  }
}

// Create Logstash stream if ELK is enabled
let logstashStream: LogstashStream | null = null;
if (ENABLE_ELK_LOGGING) {
  logstashStream = new LogstashStream(LOGSTASH_HOST, LOGSTASH_PORT);
}

// Create multi-destination stream
const createStreams = (): DestinationStream => {
  const streams: pino.StreamEntry[] = [];

  // Console transport for development
  if (NODE_ENV === 'development') {
    streams.push({
      level: LOG_LEVEL as pino.Level,
      stream: pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }),
    });
  } else {
    // JSON output for production (stdout)
    streams.push({
      level: LOG_LEVEL as pino.Level,
      stream: process.stdout,
    });
  }

  return pino.multistream(streams);
};

// Base logger configuration
const baseOptions: pino.LoggerOptions = {
  level: LOG_LEVEL,
  base: {
    service: 'pms-api',
    environment: NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
};

// Create the main logger
const logger: Logger = pino(baseOptions, createStreams());

// Wrapper to also send to Logstash
const originalInfo = logger.info.bind(logger);
const originalError = logger.error.bind(logger);
const originalWarn = logger.warn.bind(logger);
const originalDebug = logger.debug.bind(logger);
const originalFatal = logger.fatal.bind(logger);

// Helper to send log to Logstash
const sendToLogstash = (level: string, obj: object | string, msg?: string): void => {
  if (!logstashStream || !ENABLE_ELK_LOGGING) return;

  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: 'pms-api',
      environment: NODE_ENV,
      ...(typeof obj === 'object' ? obj : { message: obj }),
      ...(msg ? { message: msg } : {}),
    };
    logstashStream.write(JSON.stringify(logEntry));
  } catch (err) {
    // Silently fail to avoid recursive logging
  }
};

// Override logging methods to also send to Logstash
logger.info = ((obj: object | string, msg?: string, ...args: unknown[]) => {
  sendToLogstash('info', obj, msg);
  return originalInfo(obj as object, msg as string, ...args);
}) as typeof logger.info;

logger.error = ((obj: object | string, msg?: string, ...args: unknown[]) => {
  sendToLogstash('error', obj, msg);
  return originalError(obj as object, msg as string, ...args);
}) as typeof logger.error;

logger.warn = ((obj: object | string, msg?: string, ...args: unknown[]) => {
  sendToLogstash('warn', obj, msg);
  return originalWarn(obj as object, msg as string, ...args);
}) as typeof logger.warn;

logger.debug = ((obj: object | string, msg?: string, ...args: unknown[]) => {
  sendToLogstash('debug', obj, msg);
  return originalDebug(obj as object, msg as string, ...args);
}) as typeof logger.debug;

logger.fatal = ((obj: object | string, msg?: string, ...args: unknown[]) => {
  sendToLogstash('fatal', obj, msg);
  return originalFatal(obj as object, msg as string, ...args);
}) as typeof logger.fatal;

// Export function to create HTTP logger middleware
export const createHttpLogger = () => {
  return {
    // Custom serializers for HTTP requests
    serializers: {
      req: (req: Record<string, unknown>) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        query: req.query,
        params: req.params,
        headers: {
          'user-agent': (req.headers as Record<string, string>)?.['user-agent'],
          'content-type': (req.headers as Record<string, string>)?.['content-type'],
          host: (req.headers as Record<string, string>)?.host,
        },
        remoteAddress: req.remoteAddress,
        remotePort: req.remotePort,
      }),
      res: (res: Record<string, unknown>) => ({
        statusCode: res.statusCode,
        headers: res.headers,
      }),
    },
    // Custom log method for HTTP
    customLogLevel: (_req: unknown, res: { statusCode: number }, _err: unknown) => {
      if (res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    // Custom success message
    customSuccessMessage: (req: { method: string; url: string }, res: { statusCode: number }) => {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },
    // Custom error message
    customErrorMessage: (req: { method: string; url: string }, res: { statusCode: number }) => {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },
  };
};

// Export function to log HTTP request/response to Logstash
export const logHttpToLogstash = (
  req: { method: string; url: string; id?: string | number; headers?: Record<string, string>; ip?: string },
  res: { statusCode: number },
  responseTime: number,
  userId?: number
): void => {
  if (!logstashStream || !ENABLE_ELK_LOGGING) return;

  const logEntry = {
    timestamp: new Date().toISOString(),
    level: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
    service: 'pms-api',
    environment: NODE_ENV,
    req: {
      id: req.id,
      method: req.method,
      url: req.url,
      headers: req.headers,
      remoteAddress: req.ip,
    },
    res: {
      statusCode: res.statusCode,
    },
    responseTime,
    userId,
    message: `${req.method} ${req.url} ${res.statusCode} ${responseTime}ms`,
  };

  logstashStream.write(JSON.stringify(logEntry));
};

// Cleanup function
export const closeLogger = (): void => {
  if (logstashStream) {
    logstashStream.destroy();
  }
};

export default logger;
