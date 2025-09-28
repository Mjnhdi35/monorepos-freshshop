# 🐟 SeaFresh Shop - E-commerce Platform

A modern, scalable e-commerce platform built with **NestJS**, **PostgreSQL**, **Redis**, and **Nuxt.js** featuring role-based authentication, real-time caching, and optimized performance.

## 🚀 Live Demo & Documentation

- **🌐 Frontend**: [https://seafreshshop.com](https://seafreshshop.com)
- **📚 API Documentation**: [https://api.seafreshshop.com/docs](https://api.seafreshshop.com/docs)
- **🗄️ Database Admin**: [https://db.seafreshshop.com](https://db.seafreshshop.com)
- **📊 Redis Commander**: [https://redis.seafreshshop.com](https://redis.seafreshshop.com)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nuxt.js       │    │   NestJS        │    │   PostgreSQL    │
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
│   (Port 3000)   │    │   (Port 7000)   │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │     Redis       │
                       │   Cache &       │
                       │   Pub/Sub       │
                       │   (Port 6379)   │
                       └─────────────────┘
```

## 🛠️ Tech Stack

### Backend (NestJS)

- **Framework**: [NestJS 11](https://nestjs.com/) - Progressive Node.js framework
- **Database**: [PostgreSQL 15](https://www.postgresql.org/) - Advanced open source database
- **ORM**: [TypeORM](https://typeorm.io/) - TypeScript ORM for Node.js
- **Cache**: [Redis 7](https://redis.io/) - In-memory data structure store
- **Authentication**: [JWT](https://jwt.io/) + [Passport.js](http://www.passportjs.org/)
- **Documentation**: [Swagger/OpenAPI](https://swagger.io/)

### Frontend (Nuxt.js)

- **Framework**: [Nuxt 4](https://nuxt.com/) - The Intuitive Vue Framework
- **UI Library**: [Vue 3](https://vuejs.org/) - Progressive JavaScript framework
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

### DevOps & Tools

- **Containerization**: [Docker](https://www.docker.com/) + [Docker Compose](https://docs.docker.com/compose/)
- **Database Admin**: [PgAdmin 4](https://www.pgadmin.org/)
- **Redis Admin**: [Redis Commander](https://github.com/joeferner/redis-commander)
- **Package Manager**: [Yarn](https://yarnpkg.com/)

## 🚀 Quick Start

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Yarn](https://yarnpkg.com/getting-started/install)

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/seafreshshop.git
cd seafreshshop
```

### 2. Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, PgAdmin, and Redis Commander
cd apps/fresh_shopbe
docker-compose up -d
```

### 3. Backend Setup

```bash
cd apps/fresh_shopbe

# Install dependencies
yarn install

# Copy environment configuration
cp config.env .env

# Start development server
yarn start:dev
```

**Backend will be available at**: [http://localhost:7000](http://localhost:7000)
**API Documentation**: [http://localhost:7000/api](http://localhost:7000/api)

### 4. Frontend Setup

```bash
cd apps/fresh_shopfe

# Install dependencies
yarn install

# Start development server
yarn dev
```

**Frontend will be available at**: [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

### PostgreSQL Configuration

The application uses PostgreSQL with the following default configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=fresh_shop_user
DB_PASSWORD=fresh_shop_password
DB_DATABASE=fresh_shop_db
```

### Database Schema

The application automatically creates the following tables:

- **users** - User accounts with role-based permissions
- **roles** - System roles (super_admin, admin, seller, user)
- **permissions** - Granular permissions (users:create, products:read, etc.)
- **products** - Product catalog
- **categories** - Product categories

### Access Database Admin

- **URL**: [http://localhost:8080](http://localhost:8080)
- **Email**: admin@freshshop.com
- **Password**: admin123

## 🔐 Authentication & Authorization

### Role-Based Access Control (RBAC)

The system implements a comprehensive RBAC system with the following roles:

#### 🔴 Super Admin

- Full system access
- All permissions

#### 🟠 Admin

- User management
- Product management
- Category management
- Role viewing

#### 🟡 Seller

- Product creation/editing
- Stock management
- Category viewing

#### 🟢 User

- Product viewing
- Category viewing

### JWT Token System

- **Access Token**: Short-lived (24h) for API access
- **Refresh Token**: Long-lived (7d) for token renewal
- **Session Caching**: Redis-based session storage
- **Real-time Updates**: Redis pub/sub for token events

## 📊 Redis Integration

### Caching Strategy

- **User Sessions**: Cached for 1 hour
- **Product Data**: Cached for 5 minutes
- **User Permissions**: Cached for 1 hour
- **API Responses**: Intelligent caching based on data type

### Pub/Sub Events

- `user:created` - New user registration
- `user:updated` - User profile changes
- `user:deleted` - User account deletion
- `product:created` - New product added
- `product:updated` - Product information changes
- `product:stock_updated` - Inventory changes
- `session:refreshed` - Token refresh events
- `refresh_token:generated` - New refresh token
- `refresh_token:revoked` - Token revocation

## 🛡️ Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Security**: Signed tokens with expiration
- **Role-based Guards**: Route-level permission checking
- **Input Validation**: DTO validation with class-validator
- **SQL Injection Protection**: TypeORM parameterized queries
- **CORS Configuration**: Configurable cross-origin policies

## 📈 Performance Optimizations

### Redis Pub/Sub for Low Latency

- **Token Refresh**: Real-time token updates via pub/sub
- **Session Management**: Instant session invalidation
- **Cache Invalidation**: Automatic cache updates
- **Event Broadcasting**: Real-time system events

### Database Optimizations

- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Optimized TypeORM queries
- **Indexing**: Strategic database indexes
- **Migration System**: Version-controlled schema changes

## 🔧 Development Commands

### Backend Commands

```bash
# Development
yarn start:dev          # Start with hot reload
yarn start:debug        # Start with debugging
yarn start:prod         # Production build

# Database
yarn db:migrate         # Run migrations
yarn db:migrate:generate # Generate migration
yarn db:migrate:revert  # Revert migration

# Docker
yarn docker:up          # Start services
yarn docker:down        # Stop services
yarn docker:logs        # View logs
yarn docker:restart     # Restart services

# Testing
yarn test               # Unit tests
yarn test:e2e           # End-to-end tests
yarn test:cov           # Coverage report
```

### Frontend Commands

```bash
# Development
yarn dev                # Start dev server
yarn build              # Production build
yarn preview            # Preview production build
yarn generate           # Static site generation
```

## 🌐 API Endpoints

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Token refresh
- `GET /auth/profile` - User profile

### Users (Admin Only)

- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Products

- `GET /products` - List products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product (Seller/Admin)
- `PATCH /products/:id` - Update product (Seller/Admin)
- `DELETE /products/:id` - Delete product (Admin)

### Roles & Permissions (Admin Only)

- `GET /roles` - List all roles
- `GET /roles/permissions` - List all permissions

## 🐳 Docker Services

| Service             | Port | Description             |
| ------------------- | ---- | ----------------------- |
| **PostgreSQL**      | 5432 | Main database           |
| **Redis**           | 6379 | Cache & pub/sub         |
| **PgAdmin**         | 8080 | Database administration |
| **Redis Commander** | 8081 | Redis administration    |
| **Backend API**     | 7000 | NestJS application      |
| **Frontend**        | 3000 | Nuxt.js application     |

## 📝 Environment Variables

### Backend (.env)

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
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Application
PORT=7000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# Swagger
SWAGGER_TITLE=SeaFresh Shop API
SWAGGER_DESCRIPTION=API documentation for SeaFresh Shop
SWAGGER_VERSION=1.0
```

## 🧪 Testing

### Backend Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Coverage
yarn test:cov
```

### API Testing

Use the Swagger UI at [http://localhost:7000/api](http://localhost:7000/api) to test endpoints interactively.

## 🚀 Deployment

### Production Build

```bash
# Backend
cd apps/fresh_shopbe
yarn build
yarn start:prod

# Frontend
cd apps/fresh_shopfe
yarn build
yarn preview
```

### Docker Production

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Redis Documentation](https://redis.io/documentation)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Nuxt.js Documentation](https://nuxt.com/docs)
- [Docker Documentation](https://docs.docker.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend Developer**: [Your Name](https://github.com/yourusername)
- **Frontend Developer**: [Your Name](https://github.com/yourusername)
- **DevOps Engineer**: [Your Name](https://github.com/yourusername)

## 📞 Support

- **Email**: support@seafreshshop.com
- **Discord**: [Join our community](https://discord.gg/seafreshshop)
- **Issues**: [GitHub Issues](https://github.com/yourusername/seafreshshop/issues)

---

**Made with ❤️ by the SeaFresh Shop Team**
