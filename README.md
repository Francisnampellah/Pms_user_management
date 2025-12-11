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
