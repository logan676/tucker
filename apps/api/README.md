# Tucker API

Backend API service built with NestJS framework.

## Tech Stack

- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL + TypeORM
- **Cache**: Redis
- **Search**: Elasticsearch
- **Message Queue**: RabbitMQ
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

## Project Structure

```
src/
├── modules/                    # Business modules
│   ├── auth/                   # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── strategies/         # Passport strategies
│   │   ├── guards/
│   │   ├── dto/
│   │   └── __tests__/          # Unit tests
│   ├── user/                   # User module
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.module.ts
│   │   ├── entities/
│   │   ├── dto/
│   │   └── __tests__/
│   ├── merchant/               # Merchant module
│   │   ├── merchant.controller.ts
│   │   ├── merchant.service.ts
│   │   ├── merchant.module.ts
│   │   ├── entities/
│   │   ├── dto/
│   │   └── __tests__/
│   ├── product/                # Product module
│   │   ├── product.controller.ts
│   │   ├── product.service.ts
│   │   ├── product.module.ts
│   │   ├── entities/
│   │   ├── dto/
│   │   └── __tests__/
│   ├── order/                  # Order module
│   │   ├── order.controller.ts
│   │   ├── order.service.ts
│   │   ├── order.module.ts
│   │   ├── entities/
│   │   ├── dto/
│   │   └── __tests__/
│   ├── payment/                # Payment module
│   │   ├── payment.controller.ts
│   │   ├── payment.service.ts
│   │   ├── payment.module.ts
│   │   └── __tests__/
│   ├── search/                 # Search module
│   │   ├── search.controller.ts
│   │   ├── search.service.ts
│   │   ├── search.module.ts
│   │   └── __tests__/
│   └── notification/           # Notification module
│       ├── notification.service.ts
│       ├── notification.module.ts
│       └── __tests__/
├── common/                     # Common utilities
│   ├── decorators/             # Custom decorators
│   ├── filters/                # Exception filters
│   ├── guards/                 # Guards
│   ├── interceptors/           # Interceptors
│   ├── pipes/                  # Pipes
│   └── utils/                  # Utility functions
├── config/                     # Configuration
│   ├── database.config.ts
│   ├── redis.config.ts
│   └── app.config.ts
├── database/                   # Database
│   ├── migrations/             # Migration files
│   └── seeds/                  # Seed data
├── test/                       # E2E tests
│   ├── app.e2e-spec.ts
│   ├── auth.e2e-spec.ts
│   ├── merchant.e2e-spec.ts
│   ├── order.e2e-spec.ts
│   └── jest-e2e.json
├── app.module.ts
└── main.ts
```

## API Modules

| Module | Route Prefix | Description |
|--------|--------------|-------------|
| Auth | `/api/v1/auth` | Login, register, token refresh |
| User | `/api/v1/users` | User info, address management |
| Merchant | `/api/v1/merchants` | Merchant info, store management |
| Product | `/api/v1/products` | Product CRUD, categories |
| Order | `/api/v1/orders` | Order creation, queries, status updates |
| Payment | `/api/v1/payments` | Payment creation, callbacks |
| Search | `/api/v1/search` | Merchant & product search |

## Development

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build
pnpm build

# Production mode
pnpm start:prod
```

## Testing

```bash
# Run unit tests
pnpm test

# Run unit tests with coverage
pnpm test:cov

# Run unit tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e

# Run specific test file
pnpm test -- auth.service.spec.ts
```

### Test Coverage Requirements

- Minimum coverage: 80%
- All services must have unit tests
- All controllers must have unit tests
- Critical flows must have E2E tests

### Test Structure

```
__tests__/
├── auth.service.spec.ts        # Service unit tests
├── auth.controller.spec.ts     # Controller unit tests
└── fixtures/                   # Test fixtures
    └── user.fixture.ts

test/
├── auth.e2e-spec.ts            # E2E tests
├── order.e2e-spec.ts
└── test-utils.ts               # Test utilities
```

## Database

```bash
# Run migrations
pnpm migration:run

# Generate migration
pnpm migration:generate

# Revert migration
pnpm migration:revert

# Seed database
pnpm seed
```

## Environment Variables

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=tucker
DATABASE_PASSWORD=your_password
DATABASE_NAME=tucker

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200
```

## API Documentation

Swagger documentation is available at:
- Development: `http://localhost:3000/api/docs`
- Production: `https://api.tucker.com/api/docs`
