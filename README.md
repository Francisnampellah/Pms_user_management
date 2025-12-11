# Property Management System (PMS)

A comprehensive Property Management System API for managing multiple hotel properties, rooms, staff, and users with multi-tenant organization support and hierarchical access control.

## 🚀 Features

- **Multi-tenant Architecture**: Support for multiple organizations with their own properties
- **Role-Based Access Control (RBAC)**: Granular permissions at system, organization, and property levels
- **Complete CRUD Operations**: For organizations, properties, rooms/items, staff, and users
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Audit Logging**: Track all critical operations with detailed change history
- **Rate Limiting**: Protection against brute-force attacks
- **Input Validation**: Comprehensive request validation with Zod
- **Pagination & Filtering**: Efficient data retrieval with search capabilities

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

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
# Copy and configure environment variables
cp .env.docker .env

# Build and start all services
docker-compose up -d

# Run migrations and seed data
docker-compose run --rm migrate

# View logs
docker-compose logs -f api
```

### Services

| Service | Description | Port |
|---------|-------------|------|
| `api` | PMS REST API | 3000 |
| `postgres` | PostgreSQL Database | 5432 |
| `elasticsearch` | Log storage and search | 9200 |
| `logstash` | Log processing pipeline | 5000, 5044 |
| `kibana` | Log visualization | 5601 |
| `migrate` | Database migrations (runs once) | - |

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild and start (after code changes)
docker-compose up -d --build

# View API logs
docker-compose logs -f api

# Access PostgreSQL
docker-compose exec postgres psql -U pms_user -d pms_db

# Run Prisma Studio (for database management)
docker-compose exec api npx prisma studio

# Stop and remove all data (including volumes)
docker-compose down -v
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
docker-compose up -d elasticsearch logstash kibana

# Check Elasticsearch health
curl -u elastic:changeme http://localhost:9200/_cluster/health?pretty

# View Logstash pipeline stats
curl http://localhost:9600/_node/stats/pipelines?pretty

# View indices
curl -u elastic:changeme http://localhost:9200/_cat/indices?v

# Delete old logs (older than 7 days)
curl -X DELETE -u elastic:changeme "http://localhost:9200/pms-logs-$(date -d '7 days ago' +%Y.%m.%d)"
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
docker-compose up -d postgres api
```

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
| POST | `/properties` | Create new property |
| GET | `/properties/:id` | Get property details |
| PUT | `/properties/:id` | Update property |
| DELETE | `/properties/:id` | Delete property |

### Items (Rooms/Resources)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/items` | List all items |
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
project-root/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data script
├── src/
│   ├── config/
│   │   ├── database.ts    # Prisma client setup
│   │   └── logger.ts      # Pino logger config
│   ├── controllers/       # Route handlers
│   ├── middlewares/       # Express middlewares
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   └── app.ts             # Express app setup
├── .env.example           # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

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

- Password hashing with bcrypt (10+ rounds)
- JWT tokens with configurable expiration
- Rate limiting on all endpoints
- Stricter rate limiting on auth endpoints
- CORS configuration
- Helmet security headers
- Input sanitization
- SQL injection prevention via Prisma ORM

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:seed` | Seed the database |
| `npm run prisma:studio` | Open Prisma Studio |

## 📄 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
# Pms_user_management
