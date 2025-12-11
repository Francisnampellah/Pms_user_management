import { Request, Response, NextFunction } from 'express';
import { logHttpToLogstash } from '../config/logger';

// Extend Express Request to include start time
declare global {
  namespace Express {
    interface Request {
      startTime?: number;
      requestId?: string;
    }
  }
}

// Generate unique request ID
const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Middleware to log HTTP requests and responses to ELK stack
 * Captures request details, response status, and timing information
 */
export const elkLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Skip health check endpoints to reduce noise
  if (req.path === '/health' || req.path === '/api/health') {
    return next();
  }

  // Add request ID and start time
  req.requestId = generateRequestId();
  req.startTime = Date.now();

  // Store original json function
  const originalJson = res.json;

  // Override res.json to capture response
  res.json = function (body: unknown): Response {
    res.locals.responseBody = body;
    return originalJson.call(this, body);
  };

  // Override res.end to log after response
  const originalEndFn = res.end.bind(res);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res.end = function (chunk?: any, encodingOrCallback?: BufferEncoding | (() => void), callback?: () => void): Response {
    // Calculate response time
    const responseTime = req.startTime ? Date.now() - req.startTime : 0;

    // Get user ID from request (if authenticated)
    const userId = (req as Request & { user?: { userId: number } }).user?.userId;

    // Log to Logstash
    try {
      logHttpToLogstash(
        {
          method: req.method,
          url: req.originalUrl || req.url,
          id: req.requestId,
          headers: {
            'user-agent': req.get('user-agent') || '',
            'content-type': req.get('content-type') || '',
            host: req.get('host') || '',
            'x-forwarded-for': req.get('x-forwarded-for') || '',
          },
          ip: req.ip || req.socket.remoteAddress || '',
        },
        {
          statusCode: res.statusCode,
        },
        responseTime,
        userId
      );
    } catch (error) {
      // Silently fail - don't break the request
    }

    // Call original end with proper overload handling
    if (typeof encodingOrCallback === 'function') {
      return originalEndFn(chunk, encodingOrCallback);
    }
    if (encodingOrCallback) {
      return originalEndFn(chunk, encodingOrCallback, callback);
    }
    return originalEndFn(chunk);
  };

  next();
};

/**
 * Error logging middleware for ELK
 * Should be placed after routes but before error handler
 */
export const elkErrorLoggingMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const responseTime = req.startTime ? Date.now() - req.startTime : 0;
  const userId = (req as Request & { user?: { userId: number } }).user?.userId;

  // Log error to Logstash
  try {
    logHttpToLogstash(
      {
        method: req.method,
        url: req.originalUrl || req.url,
        id: req.requestId,
        headers: {
          'user-agent': req.get('user-agent') || '',
          'content-type': req.get('content-type') || '',
          host: req.get('host') || '',
        },
        ip: req.ip || req.socket.remoteAddress || '',
      },
      {
        statusCode: res.statusCode || 500,
      },
      responseTime,
      userId
    );
  } catch (logError) {
    // Silently fail
  }

  next(err);
};

export default elkLoggingMiddleware;
