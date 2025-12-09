# Tucker

一个完整的本地生活服务平台，提供外卖点餐、商家管理等功能。

## 项目概述

Tucker 是一个全栈本地生活服务平台，包含：
- **用户端** - iOS/Android/Web 应用，供消费者浏览商家、点餐、下单
- **商家端** - iOS/Android 应用，供商家管理店铺、处理订单
- **管理后台** - Web Dashboard，供平台运营管理
- **后端服务** - 提供 API 服务的微服务架构

## 技术栈

### 客户端
| 平台 | 技术 | 说明 |
|------|------|------|
| iOS | Swift + SwiftUI | 用户端 & 商家端 |
| Android | Kotlin + Jetpack Compose | 用户端 & 商家端 |
| Web | React + TypeScript + Next.js | 用户 Web 端 |
| Dashboard | React + TypeScript + Ant Design | 管理后台 |

### 后端
| 组件 | 技术 | 说明 |
|------|------|------|
| API Gateway | Kong / Nginx | 统一入口、限流、认证 |
| 主服务 | Node.js + NestJS | 业务逻辑 |
| 数据库 | PostgreSQL | 主数据存储 |
| 缓存 | Redis | 会话、热点数据缓存 |
| 搜索 | Elasticsearch | 商家、商品搜索 |
| 消息队列 | RabbitMQ | 异步任务处理 |
| 对象存储 | MinIO / AWS S3 | 图片、文件存储 |

## 项目结构

```
tucker/
├── apps/
│   ├── api/                    # 后端 API 服务
│   ├── web/                    # 用户 Web 端
│   ├── dashboard/              # 管理后台
│   ├── ios-customer/           # iOS 用户端
│   ├── ios-merchant/           # iOS 商家端
│   ├── android-customer/       # Android 用户端
│   └── android-merchant/       # Android 商家端
├── packages/
│   ├── shared-types/           # 共享类型定义
│   ├── api-client/             # API 客户端 SDK
│   └── ui-components/          # 共享 UI 组件
├── docs/                       # 项目文档
│   ├── architecture/           # 架构文档
│   ├── api/                    # API 文档
│   ├── database/               # 数据库文档
│   ├── mobile/                 # 移动端文档
│   └── deployment/             # 部署文档
└── infrastructure/             # 基础设施配置
    ├── docker/                 # Docker 配置
    ├── k8s/                    # Kubernetes 配置
    └── terraform/              # 云资源配置
```

## 核心功能模块

### 用户端功能
- 首页推荐与分类浏览
- 商家搜索与筛选
- 商家详情与菜单浏览
- 购物车与下单
- 订单管理与追踪
- 地址管理
- 优惠券与会员系统
- 评价与反馈

### 商家端功能
- 店铺信息管理
- 菜品管理（增删改查、上下架）
- 订单接单与处理
- 营业状态管理
- 数据统计与报表
- 评价回复

### 管理后台功能
- 用户管理
- 商家审核与管理
- 订单监控
- 数据统计与分析
- 系统配置
- 营销活动管理

## 快速开始

### 环境要求
- Node.js >= 18.x
- PostgreSQL >= 15.x
- Redis >= 7.x
- Docker & Docker Compose

### 本地开发

```bash
# 克隆项目
git clone https://github.com/your-org/tucker.git
cd tucker

# 安装依赖
pnpm install

# 启动基础设施（数据库、Redis等）
docker-compose up -d

# 启动后端服务
pnpm --filter api dev

# 启动 Web 端
pnpm --filter web dev

# 启动管理后台
pnpm --filter dashboard dev
```

### 移动端开发

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

## 文档索引

- [架构设计](./docs/architecture/README.md)
- [API 文档](./docs/api/README.md)
- [数据库设计](./docs/database/README.md)
- [移动端开发指南](./docs/mobile/README.md)
- [部署指南](./docs/deployment/README.md)

## 开发规范

- [Git 提交规范](./docs/CONTRIBUTING.md)
- [代码风格指南](./docs/CODE_STYLE.md)
- [API 设计规范](./docs/api/CONVENTIONS.md)

## License

MIT License
