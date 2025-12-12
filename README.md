# Property Management System (PMS)

A comprehensive Property Management System API for managing multiple hotel properties, rooms, staff, and users with multi-tenant organization support and hierarchical access control.

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748.svg)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![ELK Stack](https://img.shields.io/badge/ELK-8.11-005571.svg)](https://www.elastic.co/)

## 🚀 Features

- **Multi-tenant Architecture**: Support for multiple organizations with their own properties
- **Role-Based Access Control (RBAC)**: Granular permissions at system, organization, and property levels
- **Complete CRUD Operations**: For organizations, properties, rooms/items, staff, and users
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Audit Logging**: Track all critical operations with detailed change history
- **Rate Limiting**: Protection against brute-force attacks
- **Input Validation**: Comprehensive request validation with Zod
- **Pagination & Filtering**: Efficient data retrieval with search capabilities
- **ELK Stack Integration**: Centralized logging with Elasticsearch, Logstash, and Kibana
- **Docker Ready**: Full containerization with Docker Compose
- **VPS Deployment Scripts**: Automated deployment with health checks

## 📋 Prerequisites

### Local Development
- Node.js 20+ 
- PostgreSQL 15+
- npm or yarn

### Docker Deployment (Recommended)
- Docker 24+
- Docker Compose 2.20+

## 🛠️ Installation

### 1. Clone the repository

```bash
cd /path/to/PMS
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/pms_db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_ROUNDS=10
```

### 4. Set up the database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database
npm run prisma:seed
```

### 5. Start the server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

## 🐳 Docker Deployment

### Quick Start with Docker Compose

The easiest way to run the entire application stack:

```bash
# Clone the repository
git clone https://github.com/Francisnampellah/Pms_user_management.git
cd Pms_user_management
git checkout kibanaConfigs

# Copy and configure environment variables
cp .env.docker .env

# Build and start all services
docker compose up -d

# Run migrations and seed data
docker compose run --rm migrate

# View logs
docker compose logs -f api
```

### Services

| Service | Container | Description | Port |
|---------|-----------|-------------|------|
| `api` | pms-api | PMS REST API | 3000 |
| `postgres` | pms-postgres | PostgreSQL 15 Database | 5432 |
| `prisma-studio` | pms-prisma-studio | Database GUI (Prisma Studio) | 5555 |
| `elasticsearch` | pms-elasticsearch | Log storage and search (v8.11) | 9200, 9300 |
| `logstash` | pms-logstash | Log processing pipeline | 5001→5000, 5044, 9600 |
| `kibana` | pms-kibana | Log visualization (v8.11) | 5601 |
| `migrate` | pms-migrate | Database migrations (runs once) | - |

### Docker Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Rebuild and start (after code changes)
docker compose up -d --build

# View API logs
docker compose logs -f api

# Access PostgreSQL
docker compose exec postgres psql -U pms_user -d pms_db

# Run Prisma Studio (for database management)
docker compose exec api npx prisma studio

# Stop and remove all data (including volumes)
docker compose down -v

# Check service health
docker compose ps
```

### Building Docker Image Manually

```bash
# Build the image
docker build -t pms-api:latest .

# Run with external PostgreSQL
docker run -d \
  --name pms-api \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/pms_db" \
  -e JWT_SECRET="your-secret-key" \
  pms-api:latest
```

### Production Deployment

For production, update `.env` with secure values:

```env
# Generate strong secrets
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 24)
```

Recommended production settings:
- Use external managed PostgreSQL (AWS RDS, Cloud SQL, etc.)
- Set `NODE_ENV=production`
- Increase `BCRYPT_ROUNDS=12` for better security
- Configure proper `CORS_ORIGIN` for your domain
- Use a reverse proxy (nginx, Traefik) with SSL

## 📊 ELK Stack Integration (Elasticsearch, Logstash, Kibana)

The PMS API includes full ELK stack integration for centralized logging and visualization.

### Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   PMS API   │────▶│  Logstash   │────▶│  Elasticsearch  │◀────│   Kibana    │
│  (Node.js)  │     │  (TCP:5000) │     │   (Port 9200)   │     │ (Port 5601) │
└─────────────┘     └─────────────┘     └─────────────────┘     └─────────────┘
     │                    │                     │                      │
     │   JSON logs        │   Parsed &          │   Indexed            │   Visualization
     │   via TCP          │   enriched logs     │   logs               │   & dashboards
     └────────────────────┴─────────────────────┴──────────────────────┘
```

### Quick Start

```bash
# Start all services including ELK
docker-compose up -d

# Run the ELK setup script (sets passwords, creates index templates)
chmod +x elk/setup-elk.sh
./elk/setup-elk.sh

# View Logstash logs to verify connection
docker-compose logs -f logstash
```

### Accessing Kibana

1. Open http://localhost:5601 in your browser
2. Login with:
   - **Username:** `elastic`
   - **Password:** `changeme` (or your `ELASTIC_PASSWORD`)
3. Go to **Analytics → Discover**
4. Select the `pms-logs-*` data view
5. Make some API requests to see logs appear

### Log Data Structure

Each log entry contains:

| Field | Type | Description |
|-------|------|-------------|
| `@timestamp` | date | Log timestamp |
| `level` | keyword | Log level (info, warn, error) |
| `service` | keyword | Service name (pms-api) |
| `environment` | keyword | Environment (development/production) |
| `request_method` | keyword | HTTP method (GET, POST, etc.) |
| `request_url` | text | Full request URL |
| `endpoint` | keyword | API endpoint path |
| `response_status` | integer | HTTP status code |
| `status_category` | keyword | success/client_error/server_error |
| `responseTime` | integer | Response time in milliseconds |
| `response_time_category` | keyword | fast/normal/slow/very_slow |
| `userId` | integer | Authenticated user ID |
| `error_message` | text | Error message (if applicable) |

### Creating Dashboards

#### Sample Visualizations

1. **Request Count Over Time**
   - Type: Area chart
   - X-axis: `@timestamp` (date histogram)
   - Y-axis: Count

2. **Response Time Distribution**
   - Type: Line chart
   - X-axis: `@timestamp`
   - Y-axis: Average of `responseTime`

3. **Status Code Breakdown**
   - Type: Pie chart
   - Slice by: `status_category`

4. **Top Endpoints**
   - Type: Data table
   - Columns: `endpoint`, Count, Avg `responseTime`

5. **Error Log Table**
   - Type: Data table
   - Filter: `status_category: server_error OR client_error`
   - Columns: `@timestamp`, `request_method`, `request_url`, `response_status`, `error_message`

### ELK Commands

```bash
# Start only ELK services
docker compose up -d elasticsearch logstash kibana

# Check Elasticsearch health
curl -u elastic:changeme http://localhost:9200/_cluster/health?pretty

# View Logstash pipeline stats
curl http://localhost:9600/_node/stats/pipelines?pretty

# View indices
curl -u elastic:changeme http://localhost:9200/_cat/indices?v

# Delete old logs (older than 7 days) - Linux
curl -X DELETE -u elastic:changeme "http://localhost:9200/pms-logs-$(date -d '7 days ago' +%Y.%m.%d)"

# Delete old logs (older than 7 days) - macOS
curl -X DELETE -u elastic:changeme "http://localhost:9200/pms-logs-$(date -v-7d +%Y.%m.%d)"
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_ELK_LOGGING` | `true` | Enable/disable ELK logging |
| `LOGSTASH_HOST` | `logstash` | Logstash hostname |
| `LOGSTASH_PORT` | `5000` | Logstash TCP port |
| `ELASTIC_PASSWORD` | `changeme` | Elasticsearch password |

### Disabling ELK

To run without ELK stack (e.g., for local development):

```bash
# Set environment variable
ENABLE_ELK_LOGGING=false

# Or start only core services
docker compose up -d postgres api
```

## 🚀 VPS Deployment Guide

### Deployment Scripts Overview

Five convenient scripts automate the entire deployment workflow:

| Script | Purpose | Usage |
|--------|---------|-------|
| `start.sh` | Main deployment script | `./start.sh` |
| `stop.sh` | Stop all services | `./stop.sh` or `./stop.sh --remove-data` |
| `update.sh` | Update and restart API | `./update.sh --migrate` |
| `logs.sh` | View service logs | `./logs.sh api -f` |
| `status.sh` | Check service health | `./status.sh` |

### Quick Start on VPS

#### Step 1: Upload to VPS

```bash
# From your local machine
scp -r /path/to/PMS user@your-vps-ip:/opt/

# Or clone from GitHub
git clone https://github.com/Francisnampellah/Pms_user_management.git /opt/PMS
cd /opt/PMS
git checkout kibanaConfigs
```

#### Step 2: Configure Environment

```bash
cd /opt/PMS

# Create .env file
cat > .env << 'EOF'
# Application
NODE_ENV=production
PORT=3000
API_URL=http://your-vps-ip:3000

# Database
POSTGRES_USER=pms_user
POSTGRES_PASSWORD=$(openssl rand -base64 24)
POSTGRES_DB=pms_db
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}

# JWT
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=604800
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_EXPIRES_IN=2592000

# Security
BCRYPT_ROUNDS=12

# Elasticsearch
ELASTIC_PASSWORD=$(openssl rand -base64 24)
ENABLE_ELK_LOGGING=true
LOGSTASH_HOST=logstash
LOGSTASH_PORT=5000

# CORS
CORS_ORIGIN=http://your-vps-ip:3000
EOF
```

#### Step 3: Run Deployment Script

```bash
chmod +x start.sh
./start.sh
```

The script will:
- ✅ Detect OS (Ubuntu, Debian, CentOS, RHEL, Amazon Linux, macOS)
- ✅ Install Docker and Docker Compose if needed
- ✅ Install dependencies (git, curl, jq)
- ✅ Build Docker images
- ✅ Start PostgreSQL and verify connectivity
- ✅ Start Elasticsearch, Logstash, Kibana
- ✅ Start the API service
- ✅ Run database migrations
- ✅ Seed initial data
- ✅ Verify all services are healthy

#### Step 4: Verify Deployment

```bash
# Check service status
./status.sh

# Expected output shows all services healthy
# API:           ✓ Healthy
# PostgreSQL:    ✓ Healthy
# Elasticsearch: ✓ Healthy (green)
# Logstash:      ✓ Healthy
# Kibana:        ✓ Healthy
```

### Post-Deployment Access

| Service | URL | Credentials |
|---------|-----|-------------|
| PMS API | `http://your-vps-ip:3000` | Bearer JWT token |
| Kibana | `http://your-vps-ip:5601` | elastic / *password from .env* |
| PostgreSQL | `your-vps-ip:5432` | pms_user / *password from .env* |

### Management Commands

```bash
# View logs (follow mode)
./logs.sh api -f                 # Follow API logs
./logs.sh logstash -f            # Follow Logstash logs
./logs.sh all -f                 # Follow all logs
./logs.sh postgres -n 50         # Show last 50 PostgreSQL logs

# Update application
./update.sh                       # Update and restart API
./update.sh --migrate            # Update, migrate, restart
./update.sh --pull               # Pull latest images, rebuild, restart

# Stop services
./stop.sh                         # Stop but keep data
./stop.sh --remove-data          # Stop and delete all volumes

# Health checks
./status.sh                       # Full status report
```

### Troubleshooting

```bash
# Check if port 3000 is in use
netstat -tuln | grep 3000

# View detailed logs
./logs.sh api -n 200 | tail -100

# Verify Docker network
docker network ls
docker network inspect pms-network

# Check database connection
docker compose exec postgres psql -U pms_user -d pms_db -c "SELECT version();"

# Check Elasticsearch
curl -u elastic:changeme http://localhost:9200/_cluster/health?pretty

# Restart a specific service
docker compose restart api
docker compose restart postgres
```

### SSL/TLS Setup (Recommended for Production)

Use Nginx as a reverse proxy with Let's Encrypt:

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Create Nginx config at /etc/nginx/sites-available/pms
```

Example Nginx configuration:

```nginx
upstream pms {
    server localhost:3000;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://pms;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /kibana {
        proxy_pass http://localhost:5601;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### Backup Strategy

```bash
# Backup PostgreSQL
docker compose exec postgres pg_dump -U pms_user pms_db > backup_$(date +%Y%m%d).sql

# Backup Elasticsearch indices
curl -u elastic:changeme -X GET "http://localhost:9200/_cat/indices" > indices_$(date +%Y%m%d).txt

# Backup Docker volumes
docker run --rm -v pms_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup_$(date +%Y%m%d).tar.gz -C / data
```

### Monitoring

For production, monitor:
- API response times via Kibana dashboards
- Elasticsearch cluster health
- PostgreSQL connections and queries
- Docker resource usage (CPU, memory)
- Disk space on /opt/PMS and data volumes

Use `./status.sh` for quick health checks or set up automated monitoring with:
- Prometheus + Grafana
- DataDog
- New Relic
- Sentry for error tracking

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Health Check
```
GET /health
```

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get tokens |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |
| GET | `/auth/me` | Get current user profile |

### Organizations (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/organizations` | List all organizations |
| POST | `/organizations` | Create new organization |
| GET | `/organizations/:id` | Get organization details |
| PUT | `/organizations/:id` | Update organization |
| DELETE | `/organizations/:id` | Delete organization |

### Properties

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/properties` | List all properties |
| GET | `/properties/organization/:organizationId` | Get properties by organization |
| POST | `/properties` | Create new property |
| GET | `/properties/:id` | Get property details |
| PUT | `/properties/:id` | Update property |
| DELETE | `/properties/:id` | Delete property |

### Items (Rooms/Resources)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/items` | List all items |
| GET | `/items/property/:propertyId` | Get items by property |
| POST | `/items` | Create new item |
| GET | `/items/:id` | Get item details |
| PUT | `/items/:id` | Update item |
| PATCH | `/items/:id/status` | Update item status |
| DELETE | `/items/:id` | Delete item |

### Staff

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/staff` | List all staff |
| POST | `/staff` | Create staff assignment |
| GET | `/staff/:id` | Get staff details |
| PUT | `/staff/:id` | Update staff |
| DELETE | `/staff/:id` | Delete staff |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users |
| GET | `/users/:id` | Get user details |
| PUT | `/users/:id` | Update user |

### Roles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/roles` | List all roles |
| POST | `/roles` | Create new role |
| GET | `/roles/:id` | Get role details |
| PUT | `/roles/:id` | Update role |
| DELETE | `/roles/:id` | Delete role |

### Audit Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/audit-logs` | List audit logs |
| GET | `/audit-logs/:id` | Get audit log details |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings` | List all settings |
| PUT | `/settings/:key` | Update setting |

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Example Login Request

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@pms.com", "password": "Admin123!"}'
```

## 👥 Default Test Accounts

| Role | Email | Password |
|------|-------|----------|
| System Admin | admin@pms.com | Admin123! |
| Org Admin (Luxe) | orgadmin1@pms.com | User123! |
| Org Admin (Sunset) | orgadmin2@pms.com | User123! |
| Property Manager | propmanager1@pms.com | User123! |
| Staff | staff1@pms.com | User123! |

## 🔑 Role Permissions

### System Admin
- Full access to all resources and operations

### Organization Admin
- Manage organization settings
- Create/manage properties
- Manage staff and items

### Property Manager
- Manage assigned property
- Create/manage items
- View staff

### Staff
- View property and items
- Update item status

### Guest
- Read-only access to property and items

## 📁 Project Structure

```
PMS/
├── prisma/
│   ├── schema.prisma          # Database schema (8 models)
│   ├── seed.ts                # Seed data script
│   └── migrations/            # Database migrations
├── src/
│   ├── config/
│   │   ├── database.ts        # Prisma client setup
│   │   └── logger.ts          # Pino logger with ELK transport
│   ├── controllers/           # Route handlers
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── elk-logging.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rateLimiter.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── types/                 # TypeScript types
│   ├── utils/                 # Utility functions
│   ├── __tests__/             # Jest test files
│   └── app.ts                 # Express app setup
├── elk/
│   ├── elasticsearch/
│   │   └── elasticsearch.yml  # ES configuration
│   ├── logstash/
│   │   ├── Dockerfile         # Custom Logstash image
│   │   ├── config/
│   │   │   └── logstash.yml
│   │   └── pipeline/
│   │       └── logstash.conf  # Log parsing pipeline
│   ├── kibana/
│   │   └── kibana.yml         # Kibana configuration
│   └── setup-elk.sh           # ELK setup script
├── Dockerfile                 # Production API image
├── Dockerfile.migrate         # Migration image
├── docker-compose.yml         # Full stack orchestration
├── start.sh                   # VPS deployment script
├── stop.sh                    # Stop services script
├── update.sh                  # Update and restart script
├── logs.sh                    # Log viewer script
├── status.sh                  # Health check script
├── .env.example               # Environment template
├── .env.docker                # Docker environment template
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Testing

```bash
# Run tests with coverage
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🛡️ Security Features

- Password hashing with bcrypt (10+ rounds, configurable)
- JWT tokens with configurable expiration (default: 7 days)
- Refresh tokens with 30-day expiration
- Rate limiting on all endpoints (100 req/15min)
- Stricter rate limiting on auth endpoints (5 req/15min)
- CORS configuration (configurable origin)
- Helmet security headers
- Input sanitization with Zod
- SQL injection prevention via Prisma ORM
- Non-root Docker containers

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript for production |
| `npm start` | Start production server |
| `npm test` | Run tests with coverage |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:seed` | Seed the database |
| `npm run prisma:studio` | Open Prisma Studio |

## 🐚 Deployment Scripts

| Script | Description |
|--------|-------------|
| `./start.sh` | Full VPS deployment (installs Docker, builds, starts all) |
| `./stop.sh` | Stop all services (use `--remove-data` to delete volumes) |
| `./update.sh` | Update and restart API (use `--migrate` for migrations) |
| `./logs.sh` | View service logs (e.g., `./logs.sh api -f`) |
| `./status.sh` | Check health status of all services |

## 🔗 Quick Links (After Deployment)

| Resource | URL |
|----------|-----|
| API Health | http://localhost:3000/health |
| API Base | http://localhost:3000/api/v1 |
| Prisma Studio | http://localhost:5555 |
| Kibana | http://localhost:5601 |
| Elasticsearch | http://localhost:9200 |

## 📄 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Repository:** [Francisnampellah/Pms_user_management](https://github.com/Francisnampellah/Pms_user_management)  
**Branch:** `kibanaConfigs`
