# Tucker Architecture Design

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Client Layer                               │
├─────────┬─────────┬─────────┬─────────┬─────────┬─────────────────┤
│   iOS   │ Android │   Web   │Dashboard│   iOS   │    Android      │
│Customer │Customer │Customer │  Admin  │Merchant │    Merchant     │
└────┬────┴────┬────┴────┬────┴────┬────┴────┬────┴───────┬─────────┘
     │         │         │         │         │            │
     └─────────┴─────────┴────┬────┴─────────┴────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Load Balancer   │
                    │   (Nginx/ALB)     │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │   API Gateway     │
                    │   (Kong/Nginx)    │
                    │ - Rate Limiting   │
                    │ - Authentication  │
                    │ - Routing         │
                    └─────────┬─────────┘
                              │
     ┌────────────────────────┼────────────────────────┐
     │                        │                        │
┌────▼────┐            ┌──────▼──────┐          ┌─────▼─────┐
│  Auth   │            │    Main     │          │  Search   │
│ Service │            │   Service   │          │  Service  │
│ (JWT)   │            │  (NestJS)   │          │   (ES)    │
└────┬────┘            └──────┬──────┘          └─────┬─────┘
     │                        │                       │
     │        ┌───────────────┼───────────────┐       │
     │        │               │               │       │
     │   ┌────▼────┐    ┌─────▼─────┐   ┌─────▼─────┐ │
     │   │ Payment │    │  Order    │   │Notification│ │
     │   │ Service │    │  Service  │   │  Service  │ │
     │   └────┬────┘    └─────┬─────┘   └─────┬─────┘ │
     │        │               │               │       │
     └────────┴───────────────┴───────────────┴───────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
    ┌────▼────┐         ┌─────▼─────┐       ┌─────▼─────┐
    │PostgreSQL│         │   Redis   │       │Elasticsearch│
    │(Primary) │         │  Cluster  │       │  Cluster   │
    └─────────┘         └───────────┘       └────────────┘
```

## 2. Technology Stack

### 2.1 Backend Services

| Component | Technology | Version | Description |
|-----------|------------|---------|-------------|
| Framework | NestJS | 10.x | TypeScript framework, modular design |
| Runtime | Node.js | 20.x LTS | High concurrency I/O |
| ORM | TypeORM | 0.3.x | Database operations |
| Validation | class-validator | - | DTO validation |
| API Docs | Swagger | - | OpenAPI 3.0 |
| Auth | Passport + JWT | - | Stateless authentication |

### 2.2 Data Storage

| Component | Technology | Purpose |
|-----------|------------|---------|
| Primary DB | PostgreSQL 15 | Business data persistence |
| Cache | Redis 7 | Session, hot data, distributed locks |
| Search Engine | Elasticsearch 8 | Merchant & product full-text search |
| Object Storage | MinIO / S3 | Image & file storage |
| Message Queue | RabbitMQ | Async tasks, event-driven |

### 2.3 Client Applications

| Platform | Tech Stack | Description |
|----------|------------|-------------|
| iOS Customer | Swift + SwiftUI | Customer app, iOS 16+ |
| iOS Merchant | Swift + SwiftUI | Merchant app, iOS 16+ |
| Android Customer | Kotlin + Compose | Customer app, SDK 26+ |
| Android Merchant | Kotlin + Compose | Merchant app, SDK 26+ |
| Web | Next.js 14 + React | Customer web, SSR |
| Dashboard | React + Vite | Admin panel, SPA |

### 2.4 Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Containerization | Docker | Application packaging |
| Orchestration | Kubernetes | Container orchestration (prod) |
| CI/CD | GitHub Actions | Automated build & deploy |
| Monitoring | Prometheus + Grafana | Metrics monitoring |
| Logging | ELK Stack | Log collection & analysis |
| APM | Sentry | Error tracking |

## 3. Module Design

### 3.1 Backend Modules

```
┌─────────────────────────────────────────────────┐
│                   API Gateway                    │
├─────────────────────────────────────────────────┤
│  Auth Module  │  User auth, token mgmt, perms   │
├───────────────┼─────────────────────────────────┤
│  User Module  │  User info, address management  │
├───────────────┼─────────────────────────────────┤
│Merchant Module│  Merchant info, store management│
├───────────────┼─────────────────────────────────┤
│Product Module │  Product CRUD, categories       │
├───────────────┼─────────────────────────────────┤
│ Order Module  │  Order creation, status flow    │
├───────────────┼─────────────────────────────────┤
│Payment Module │  Payment creation, callbacks    │
├───────────────┼─────────────────────────────────┤
│ Search Module │  Merchant & product search      │
├───────────────┼─────────────────────────────────┤
│Notification   │  Push notifications, SMS, WS    │
└───────────────┴─────────────────────────────────┘
```

### 3.2 Client Modules

**Customer App**
```
Home        → Home recommendations, categories, banner
Search      → Search, filtering, sorting
Merchant    → Merchant details, menu, reviews
Cart        → Shopping cart
Order       → Ordering, order list, order tracking
User        → Profile, settings
Address     → Address management
```

**Merchant App**
```
Dashboard   → Data dashboard, today's stats
Orders      → Order management, order processing
Products    → Product management, availability
Store       → Store settings, business management
Settings    → Account settings, notification settings
```

## 4. Data Flow Design

### 4.1 Order Flow

```
┌────────┐     ┌────────┐     ┌────────┐     ┌────────┐
│ Client │────▶│  API   │────▶│ Order  │────▶│ Payment│
│  App   │     │Gateway │     │Service │     │Service │
└────────┘     └────────┘     └────────┘     └────────┘
    │                              │              │
    │                              ▼              │
    │                        ┌─────────┐          │
    │                        │PostgreSQL│          │
    │                        └─────────┘          │
    │                              │              │
    │              ┌───────────────┘              │
    │              ▼                              │
    │        ┌──────────┐                         │
    │        │ RabbitMQ │◀────────────────────────┘
    │        └────┬─────┘
    │             │
    │             ▼
    │     ┌──────────────┐
    │     │ Notification │
    │     │   Service    │
    │     └──────────────┘
    │             │
    │◀────────────┘ (Push)
```

### 4.2 Search Flow

```
┌────────┐     ┌────────┐     ┌────────┐     ┌─────────────┐
│ Client │────▶│  API   │────▶│ Search │────▶│Elasticsearch│
│  App   │     │Gateway │     │Service │     │             │
└────────┘     └────────┘     └────────┘     └─────────────┘
                                  │
                                  ▼
                             ┌────────┐
                             │ Redis  │ (Hot search cache)
                             └────────┘
```

## 5. API Design Guidelines

### 5.1 URL Convention

```
GET    /api/v1/merchants          # List merchants
GET    /api/v1/merchants/:id      # Get merchant details
POST   /api/v1/orders             # Create order
PUT    /api/v1/orders/:id/status  # Update order status
DELETE /api/v1/addresses/:id      # Delete address
```

### 5.2 Response Format

```json
// Success response
{
  "code": 0,
  "message": "success",
  "data": { ... }
}

// Paginated response
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}

// Error response
{
  "code": 10001,
  "message": "User not found",
  "data": null
}
```

### 5.3 Error Code Convention

| Range | Description |
|-------|-------------|
| 0 | Success |
| 10000-19999 | User-related errors |
| 20000-29999 | Merchant-related errors |
| 30000-39999 | Order-related errors |
| 40000-49999 | Payment-related errors |
| 50000-59999 | System errors |

## 6. Security Design

### 6.1 Authentication

- JWT Token authentication
- Access Token (short-lived, 15 minutes)
- Refresh Token (long-lived, 7 days)
- Token blacklist (Redis)

### 6.2 Data Security

- HTTPS site-wide encryption
- Sensitive data encryption (phone, password)
- API signature verification
- SQL injection protection (ORM)
- XSS protection

### 6.3 Access Control

- RBAC permission model
- API rate limiting (IP, user)
- Two-factor auth for sensitive operations

## 7. Deployment Architecture

### 7.1 Development Environment

```
┌─────────────────────────────────────┐
│           Docker Compose            │
├──────┬──────┬──────┬──────┬────────┤
│ API  │  DB  │Redis │  ES  │ MinIO  │
└──────┴──────┴──────┴──────┴────────┘
```

### 7.2 Production Environment

```
┌─────────────────────────────────────────────────────┐
│                    Kubernetes                        │
├─────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │API Pod 1│  │API Pod 2│  │API Pod 3│  (HPA)      │
│  └─────────┘  └─────────┘  └─────────┘             │
├─────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │  PostgreSQL RDS  │  │   Redis Cluster  │        │
│  │  (Primary/Replica)│  │    (3 nodes)    │        │
│  └──────────────────┘  └──────────────────┘        │
├─────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │  Elasticsearch   │  │    S3 / OSS      │        │
│  │   (3 nodes)      │  │                  │        │
│  └──────────────────┘  └──────────────────┘        │
└─────────────────────────────────────────────────────┘
```

## 8. Scalability Considerations

### 8.1 Horizontal Scaling

- Stateless API service design, supports multiple instances
- Redis cluster mode
- Elasticsearch sharding
- Database read-write separation

### 8.2 Vertical Decomposition

As business grows, monolith can be split into microservices:

```
Main Service → User Service
             → Merchant Service
             → Order Service
             → Payment Service
             → Search Service
             → Notification Service
```
