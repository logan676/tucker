# Tucker AWS 部署指南

## 架构概览

```
                    ┌─────────────────┐
                    │   Route 53      │
                    │  (DNS 管理)      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   CloudFront    │
                    │  (CDN + SSL)    │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
┌────────▼────────┐ ┌────────▼────────┐ ┌────────▼────────┐
│   S3 Bucket     │ │ Application LB  │ │   Cloudinary    │
│  (Dashboard)    │ │   (API 负载均衡) │ │   (图片存储)     │
└─────────────────┘ └────────┬────────┘ └─────────────────┘
                             │
                    ┌────────▼────────┐
                    │   ECS Fargate   │
                    │  (API 容器服务)   │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
┌────────▼────────┐ ┌────────▼────────┐
│  RDS PostgreSQL │ │  ElastiCache    │
│   (数据库)       │ │   (Redis)       │
└─────────────────┘ └─────────────────┘
```

---

## 第一步：准备工作

### 1.1 安装 AWS CLI
```bash
# macOS
brew install awscli

# 配置凭证
aws configure
# AWS Access Key ID: xxx
# AWS Secret Access Key: xxx
# Default region name: ap-southeast-2  (Sydney)
# Default output format: json
```

### 1.2 安装 Docker
```bash
# 确保 Docker Desktop 已安装并运行
docker --version
```

---

## 第二步：创建 AWS 资源

### 2.1 创建 VPC 和子网

```bash
# 使用 AWS 控制台创建 VPC，或使用 CloudFormation
# 建议使用默认 VPC 快速开始
```

### 2.2 创建 RDS PostgreSQL

```bash
# 通过 AWS 控制台创建
# 1. 进入 RDS → Create database
# 2. 选择 PostgreSQL 15
# 3. 选择 Free tier 或 Production
# 4. 设置:
#    - DB instance identifier: tucker-db
#    - Master username: tucker_admin
#    - Master password: <your-strong-password>
#    - DB instance class: db.t3.micro (开发) / db.t3.small (生产)
#    - Storage: 20 GB gp3
#    - VPC: 默认 VPC
#    - Public access: No (生产) / Yes (开发测试)
# 5. 创建后记录 Endpoint
```

### 2.3 创建 ElastiCache Redis

```bash
# 1. 进入 ElastiCache → Create cluster
# 2. 选择 Redis OSS
# 3. 设置:
#    - Name: tucker-redis
#    - Node type: cache.t3.micro
#    - Number of replicas: 0 (开发) / 1 (生产)
# 4. 创建后记录 Primary endpoint
```

### 2.4 创建 ECR 仓库

```bash
# 创建 API 镜像仓库
aws ecr create-repository \
  --repository-name tucker/api \
  --region ap-southeast-2

# 创建 Dashboard 镜像仓库 (可选，也可用 S3)
aws ecr create-repository \
  --repository-name tucker/dashboard \
  --region ap-southeast-2
```

---

## 第三步：构建和推送 Docker 镜像

### 3.1 登录 ECR

```bash
aws ecr get-login-password --region ap-southeast-2 | \
  docker login --username AWS --password-stdin \
  <your-account-id>.dkr.ecr.ap-southeast-2.amazonaws.com
```

### 3.2 构建和推送 API 镜像

```bash
cd apps/api

# 构建镜像
docker build -t tucker/api:latest .

# 标记镜像
docker tag tucker/api:latest \
  <your-account-id>.dkr.ecr.ap-southeast-2.amazonaws.com/tucker/api:latest

# 推送镜像
docker push \
  <your-account-id>.dkr.ecr.ap-southeast-2.amazonaws.com/tucker/api:latest
```

### 3.3 构建 Dashboard

```bash
cd apps/dashboard

# 构建静态文件
VITE_API_URL=https://api.tucker.com.au npm run build

# 上传到 S3 (见下一步)
```

---

## 第四步：部署 API 到 ECS Fargate

### 4.1 创建 ECS 集群

```bash
aws ecs create-cluster --cluster-name tucker-cluster
```

### 4.2 创建任务定义

创建 `task-definition.json`:

```json
{
  "family": "tucker-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "tucker-api",
      "image": "<account-id>.dkr.ecr.ap-southeast-2.amazonaws.com/tucker/api:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "3000"}
      ],
      "secrets": [
        {
          "name": "DB_HOST",
          "valueFrom": "arn:aws:ssm:ap-southeast-2:<account-id>:parameter/tucker/db-host"
        },
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:ssm:ap-southeast-2:<account-id>:parameter/tucker/db-password"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:ssm:ap-southeast-2:<account-id>:parameter/tucker/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/tucker-api",
          "awslogs-region": "ap-southeast-2",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

```bash
# 注册任务定义
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

### 4.3 创建 Application Load Balancer

```bash
# 通过 AWS 控制台创建 ALB
# 1. 进入 EC2 → Load Balancers → Create
# 2. 选择 Application Load Balancer
# 3. 设置:
#    - Name: tucker-api-alb
#    - Scheme: Internet-facing
#    - IP address type: IPv4
#    - VPC: 选择你的 VPC
#    - Subnets: 选择多个可用区
# 4. 创建 Target Group:
#    - Target type: IP
#    - Protocol: HTTP
#    - Port: 3000
#    - Health check path: /health
# 5. 配置 HTTPS 监听器 (需要 ACM 证书)
```

### 4.4 创建 ECS 服务

```bash
aws ecs create-service \
  --cluster tucker-cluster \
  --service-name tucker-api-service \
  --task-definition tucker-api:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:ap-southeast-2:<account-id>:targetgroup/tucker-api-tg/xxx,containerName=tucker-api,containerPort=3000"
```

---

## 第五步：部署 Dashboard 到 S3 + CloudFront

### 5.1 创建 S3 Bucket

```bash
# 创建 bucket
aws s3 mb s3://tucker-dashboard-prod --region ap-southeast-2

# 配置静态网站托管
aws s3 website s3://tucker-dashboard-prod \
  --index-document index.html \
  --error-document index.html
```

### 5.2 上传文件

```bash
cd apps/dashboard

# 构建
VITE_API_URL=https://api.tucker.com.au npm run build

# 上传
aws s3 sync dist/ s3://tucker-dashboard-prod --delete

# 设置缓存策略
aws s3 cp dist/ s3://tucker-dashboard-prod \
  --recursive \
  --cache-control "max-age=31536000" \
  --exclude "index.html"

aws s3 cp dist/index.html s3://tucker-dashboard-prod/index.html \
  --cache-control "no-cache"
```

### 5.3 创建 CloudFront 分发

```bash
# 通过 AWS 控制台创建
# 1. 进入 CloudFront → Create distribution
# 2. Origin domain: tucker-dashboard-prod.s3.ap-southeast-2.amazonaws.com
# 3. 启用 OAC (Origin Access Control)
# 4. Default root object: index.html
# 5. 添加自定义错误响应: 403/404 → /index.html (200)
# 6. 关联 ACM 证书 (必须在 us-east-1 创建)
# 7. Alternate domain names: admin.tucker.com.au
```

---

## 第六步：配置域名和 SSL

### 6.1 申请 SSL 证书

```bash
# API 证书 (Sydney)
aws acm request-certificate \
  --domain-name api.tucker.com.au \
  --validation-method DNS \
  --region ap-southeast-2

# Dashboard 证书 (必须在 us-east-1)
aws acm request-certificate \
  --domain-name admin.tucker.com.au \
  --validation-method DNS \
  --region us-east-1
```

### 6.2 配置 Route 53

```bash
# 创建 Hosted Zone (如果域名不在 Route 53)
aws route53 create-hosted-zone \
  --name tucker.com.au \
  --caller-reference $(date +%s)

# 添加记录
# api.tucker.com.au → ALB
# admin.tucker.com.au → CloudFront
```

---

## 第七步：设置 CI/CD (GitHub Actions)

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

env:
  AWS_REGION: ap-southeast-2
  ECR_REPOSITORY: tucker/api
  ECS_CLUSTER: tucker-cluster
  ECS_SERVICE: tucker-api-service

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push API image
        working-directory: apps/api
        run: |
          docker build -t ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY }}:${{ github.sha }} .
          docker push ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY }}:${{ github.sha }}

      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster ${{ env.ECS_CLUSTER }} \
            --service ${{ env.ECS_SERVICE }} \
            --force-new-deployment

  deploy-dashboard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/dashboard/package-lock.json

      - name: Install and build
        working-directory: apps/dashboard
        run: |
          npm ci
          VITE_API_URL=${{ secrets.API_URL }} npm run build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to S3
        working-directory: apps/dashboard
        run: |
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

---

## 成本估算 (月)

| 服务 | 规格 | 成本 (USD) |
|------|------|------------|
| ECS Fargate | 2 x 0.25 vCPU, 0.5 GB | ~$20 |
| RDS PostgreSQL | db.t3.micro | ~$15 |
| ElastiCache Redis | cache.t3.micro | ~$12 |
| ALB | 1 个 | ~$16 |
| CloudFront | 100 GB 传输 | ~$10 |
| S3 | 10 GB | ~$0.25 |
| Route 53 | 1 hosted zone | ~$0.50 |
| **总计** | | **~$75/月** |

> 生产环境建议升级 RDS 和 ElastiCache 规格，成本约 $150-200/月

---

## 常用命令

```bash
# 查看 ECS 服务状态
aws ecs describe-services --cluster tucker-cluster --services tucker-api-service

# 查看日志
aws logs tail /ecs/tucker-api --follow

# 强制重新部署
aws ecs update-service --cluster tucker-cluster --service tucker-api-service --force-new-deployment

# 扩缩容
aws ecs update-service --cluster tucker-cluster --service tucker-api-service --desired-count 3
```

---

## 故障排除

### API 无法启动
1. 检查 CloudWatch 日志: `/ecs/tucker-api`
2. 验证环境变量和 Secrets
3. 确认安全组允许出站连接到 RDS 和 Redis

### 数据库连接失败
1. 检查 RDS 安全组是否允许 ECS 安全组入站
2. 确认 DB_HOST 是正确的 RDS endpoint

### 图片上传失败
1. 检查 Cloudinary 凭证
2. 确认 API 有网络出站权限
