# 🐟 SeaFresh Shop Backend API

A robust, scalable e-commerce backend built with **NestJS 11**, **PostgreSQL**, **Redis**, and **TypeORM** featuring advanced authentication, role-based permissions, and real-time caching.

## 🌐 Live Services

- **🚀 API Server**: [https://api.seafreshshop.com](https://api.seafreshshop.com)
- **📚 API Documentation**: [https://api.seafreshshop.com/docs](https://api.seafreshshop.com/docs)
- **🗄️ Database Admin**: [https://db.seafreshshop.com](https://db.seafreshshop.com) (admin@freshshop.com / admin123)
- **📊 Redis Commander**: [https://redis.seafreshshop.com](https://redis.seafreshshop.com)

## 🚀 Quick Start

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Docker](https://www.docker.com/get-started)
- [Yarn](https://yarnpkg.com/getting-started/install)

### Setup

```bash
# Install dependencies
yarn install

# Start infrastructure services
yarn docker:up

# Start development server
yarn start:dev
```

**API**: [http://localhost:7000](http://localhost:7000)
**Swagger**: [http://localhost:7000/api](http://localhost:7000/api)

## 🔐 Authentication System

### JWT Token Architecture

- **Access Token (`access_token`)**: 24h lifetime, returned on login/register and rotated via refresh
- **Refresh Token (`refresh_token`)**: 7d lifetime, stored in Redis, rotates and invalidates old sessions
- **Session ID (`session_id`)**: Redis key to track user session and refresh linkage
- **Session Caching**: Redis-based storage for sessions and user context
- **Real-time Updates**: Pub/sub events for token/session management

### Role-Based Access Control

- **Super Admin**: Full system access
- **Admin**: User/product management
- **Seller**: Product management
- **User**: Basic access

## 📊 Redis Integration

### Caching Strategy

- User Sessions: 1 hour
- Product Data: 5 minutes
- User Permissions: 1 hour

### Pub/Sub Events

- `user:created`, `user:updated`, `user:deleted`
- `product:created`, `product:updated`, `product:stock_updated`
- `session:refreshed`, `token:refreshed`

## 🛠️ Development Commands

```bash
# Development
yarn start:dev          # Hot reload
yarn start:debug        # Debug mode

# Database
yarn db:migrate         # Run migrations
yarn db:migrate:generate -- -n MigrationName

# Docker
yarn docker:up          # Start services
yarn docker:down        # Stop services
yarn docker:logs        # View logs

# Testing
yarn test               # Unit tests
yarn test:e2e           # E2E tests
yarn test:cov           # Coverage
```

## 🌐 API Endpoints

### Authentication

- `POST /auth/register` - User registration
  - Request body:
    - `{ email, username, firstName, lastName, password, phone, address }`
  - Response:
    - `{ access_token, refresh_token, session_id, user }`
- `POST /auth/login` - User login
  - Request body:
    - `{ emailOrUsername, password }`
  - Response:
    - `{ access_token, refresh_token, session_id, user }`
- `POST /auth/refresh` - Token refresh (Redis optimized)
  - Request body:
    - `{ refresh_token, session_id }`
  - Response:
    - `{ access_token, refresh_token, session_id }`
- `GET /auth/profile` - User profile (Authorization: Bearer access_token)

- `GET /auth/google` → Google OAuth 2.0 login
- `GET /auth/google/callback` → Google OAuth callback (returns `{ access_token, refresh_token, session_id, user }`)

### Products

- `GET /products` - List products
- `POST /products` - Create product (Seller/Admin)
- `PATCH /products/:id` - Update product
- `PATCH /products/:id/stock` - Update stock

### Users (Admin)

- `GET /users` - List users
- `POST /users` - Create user
- `PATCH /users/:id` - Update user

## 📝 Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=fresh_shop_user
DB_PASSWORD=fresh_shop_password
DB_DATABASE=fresh_shop_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:7000/api/v1/auth/google/callback

# Application
PORT=7000
NODE_ENV=development
```

## 🗄️ Database Access

- **PgAdmin**: [http://localhost:8080](http://localhost:8080)
- **Email**: admin@freshshop.com
- **Password**: admin123
- **Redis Commander**: [http://localhost:8081](http://localhost:8081)

## 🚀 Production Deployment

```bash
# Build
yarn build

# Start production
yarn start:prod
```

## 📚 Resources

- [NestJS Docs](https://docs.nestjs.com/)
- [TypeORM Docs](https://typeorm.io/)
- [Redis Docs](https://redis.io/documentation)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**Built with ❤️ using NestJS, PostgreSQL, and Redis**
