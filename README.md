# Tucker

A comprehensive local life service platform providing food delivery, merchant management, and more.

## Overview

Tucker is a full-stack local life service platform consisting of:
- **Customer Apps** - iOS/Android/Web applications for consumers to browse merchants, order food, and manage orders
- **Merchant Apps** - iOS/Android applications for merchants to manage stores and process orders
- **Dashboard** - Web admin panel for platform operations management
- **API Services** - Backend microservices architecture

## Tech Stack

### Client Applications
| Platform | Technology | Description |
|----------|------------|-------------|
| iOS | Swift + SwiftUI | Customer & Merchant apps |
| Android | Kotlin + Jetpack Compose | Customer & Merchant apps |
| Web | React + TypeScript + Next.js | Customer web application |
| Dashboard | React + TypeScript + Ant Design | Admin panel |

### Backend
| Component | Technology | Description |
|-----------|------------|-------------|
| API Gateway | Kong / Nginx | Unified entry, rate limiting, auth |
| Main Service | Node.js + NestJS | Business logic |
| Database | PostgreSQL | Primary data storage |
| Cache | Redis | Session, hot data caching |
| Search | Elasticsearch | Merchant & product search |
| Message Queue | RabbitMQ | Async task processing |
| Object Storage | MinIO / AWS S3 | Image & file storage |

## Project Structure

```
tucker/
├── apps/
│   ├── api/                    # Backend API service
│   ├── web/                    # Customer web application
│   ├── dashboard/              # Admin dashboard
│   ├── ios-customer/           # iOS customer app
│   ├── ios-merchant/           # iOS merchant app
│   ├── android-customer/       # Android customer app
│   └── android-merchant/       # Android merchant app
├── packages/
│   ├── shared-types/           # Shared TypeScript types
│   ├── api-client/             # API client SDK
│   └── ui-components/          # Shared UI components
├── docs/                       # Documentation
│   ├── architecture/           # Architecture docs
│   ├── api/                    # API docs
│   ├── database/               # Database docs
│   ├── mobile/                 # Mobile development docs
│   └── deployment/             # Deployment docs
└── infrastructure/             # Infrastructure configs
    ├── docker/                 # Docker configs
    ├── k8s/                    # Kubernetes configs
    └── terraform/              # Cloud resource configs
```

## Core Features

### Customer App Features
- Home page recommendations and category browsing
- Merchant search and filtering
- Merchant details and menu browsing
- Shopping cart and checkout
- Order management and tracking
- Address management
- Coupons and membership system
- Reviews and feedback

### Merchant App Features
- Store information management
- Product management (CRUD, availability)
- Order receiving and processing
- Business status management
- Data statistics and reports
- Review replies

### Dashboard Features
- User management
- Merchant review and management
- Order monitoring
- Data analytics
- System configuration
- Marketing campaign management

## Getting Started

### Prerequisites
- Node.js >= 18.x
- PostgreSQL >= 15.x
- Redis >= 7.x
- Docker & Docker Compose

### Local Development

```bash
# Clone the project
git clone https://github.com/logan676/tucker.git
cd tucker

# Install dependencies
pnpm install

# Start infrastructure (database, Redis, etc.)
docker-compose up -d

# Start backend service
pnpm --filter api dev

# Start web application
pnpm --filter web dev

# Start dashboard
pnpm --filter dashboard dev
```

### Mobile Development

**iOS:**
```bash
cd apps/ios-customer
pod install
open TuckerCustomer.xcworkspace
```

**Android:**
```bash
cd apps/android-customer
./gradlew assembleDebug
```

## Testing

Each application includes comprehensive testing:

```bash
# Run all tests
pnpm test

# Run API tests
pnpm --filter api test

# Run dashboard tests
pnpm --filter dashboard test

# Run web tests
pnpm --filter web test
```

See individual app READMEs for detailed testing instructions.

## Documentation

- [Architecture Design](./docs/architecture/README.md)
- [API Documentation](./docs/api/README.md)
- [Database Design](./docs/database/README.md)
- [Mobile Development Guide](./docs/mobile/README.md)
- [Deployment Guide](./docs/deployment/README.md)
- [Testing Guide](./docs/testing/README.md)

## Contributing

- [Git Commit Guidelines](./docs/CONTRIBUTING.md)
- [Code Style Guide](./docs/CODE_STYLE.md)
- [API Design Conventions](./docs/api/CONVENTIONS.md)

## License

MIT License
