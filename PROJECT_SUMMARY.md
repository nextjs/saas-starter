# 项目总体结构与功能说明

本文档提供了整个项目的总体结构和功能说明，帮助开发者快速了解项目架构和各个模块的功能。

## 项目概述

这是一个基于Next.js构建的SaaS启动模板，集成了用户认证、团队管理、订阅支付和API密钥管理等核心功能。项目使用PostgreSQL数据库和Drizzle ORM进行数据管理，使用Stripe处理支付和订阅。

## 目录结构

```
/
├── app/                    # Next.js应用目录
│   ├── (auth)/             # 认证相关页面
│   ├── (dashboard)/        # 仪表板相关页面
│   ├── (marketing)/        # 营销相关页面
│   └── api/                # API路由
├── components/             # React组件
│   ├── ui/                 # UI组件库
│   ├── dashboard/          # 仪表板组件
│   └── marketing/          # 营销组件
├── hooks/                  # 自定义React Hooks
├── lib/                    # 核心库和工具函数
│   ├── auth/               # 认证相关功能
│   ├── db/                 # 数据库相关功能
│   └── payments/           # 支付相关功能
├── public/                 # 静态资源
└── styles/                 # 样式文件
```

## 核心模块

### 1. 认证模块 (app/(auth) & lib/auth)

认证模块负责用户注册、登录、登出和会话管理。

**主要功能：**
- 用户注册和登录
- 密码哈希和验证
- JWT会话管理
- 权限控制

**关键文件：**
- `lib/auth/session.ts`: 会话管理和JWT处理
- `lib/auth/middleware.ts`: 认证中间件
- `app/(auth)/sign-in/page.tsx`: 登录页面
- `app/(auth)/sign-up/page.tsx`: 注册页面

### 2. 数据库模块 (lib/db)

数据库模块负责数据库连接、模式定义、查询和迁移。

**主要功能：**
- 数据库连接管理
- 表结构定义
- 数据查询和操作
- 数据迁移

**关键文件：**
- `lib/db/schema.ts`: 数据库模式定义
- `lib/db/drizzle.ts`: Drizzle ORM配置
- `lib/db/queries.ts`: 数据库查询函数
- `lib/db/migrations/`: 数据库迁移文件

### 3. 支付模块 (lib/payments)

支付模块负责与Stripe集成，处理订阅和支付。

**主要功能：**
- Stripe结账流程
- 订阅管理
- 客户门户
- Webhook处理

**关键文件：**
- `lib/payments/stripe.ts`: Stripe API集成
- `lib/payments/actions.ts`: 支付相关服务器操作
- `app/api/stripe/webhook/route.ts`: Stripe Webhook处理

### 4. 仪表板模块 (app/(dashboard))

仪表板模块提供用户登录后的主要功能界面。

**主要功能：**
- 概览页面
- 团队管理
- API密钥管理
- 活动日志
- 订阅管理

**关键文件：**
- `app/(dashboard)/layout.tsx`: 仪表板布局
- `app/(dashboard)/page.tsx`: 仪表板首页
- `app/(dashboard)/team/page.tsx`: 团队管理页面
- `app/(dashboard)/api-keys/page.tsx`: API密钥管理页面

### 5. 营销模块 (app/(marketing))

营销模块包含面向公众的页面，如首页、博客、文档和定价页面。

**主要功能：**
- 首页展示
- 博客文章
- 文档页面
- 定价页面

**关键文件：**
- `app/(marketing)/page.tsx`: 首页
- `app/(marketing)/blog/page.tsx`: 博客页面
- `app/(marketing)/docs/page.tsx`: 文档页面
- `app/(marketing)/pricing/page.tsx`: 定价页面

### 6. API模块 (app/api)

API模块提供后端API端点，用于前端和外部服务的数据交互。

**主要功能：**
- 用户API
- 团队API
- 活动日志API
- Stripe Webhook处理

**关键文件：**
- `app/api/user/route.ts`: 用户API
- `app/api/team/route.ts`: 团队API
- `app/api/activity/route.ts`: 活动日志API
- `app/api/api-keys/route.ts`: API密钥管理API

## 数据模型

项目使用以下主要数据模型：

1. **用户 (users)**
   - 存储用户基本信息
   - 包括名称、邮箱、密码哈希等

2. **团队 (teams)**
   - 存储团队信息
   - 包括订阅和计划相关数据

3. **团队成员 (teamMembers)**
   - 存储用户与团队的关联关系

4. **活动日志 (activityLogs)**
   - 记录系统中的用户活动
   - 用于审计和跟踪

5. **邀请 (invitations)**
   - 存储团队成员邀请信息

6. **订阅计划 (plans)**
   - 存储可用的订阅计划信息

7. **API密钥 (apiKeys)**
   - 存储用户创建的API访问密钥

8. **API使用记录 (apiUsage)**
   - 跟踪API的使用情况

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI组件库**: shadcn/ui + Tailwind CSS
- **状态管理**: React Context + SWR
- **数据库**: PostgreSQL
- **ORM**: Drizzle ORM
- **认证**: 自定义JWT认证
- **支付处理**: Stripe
- **部署**: Vercel (推荐)

## 主要功能流程

### 用户注册流程

1. 用户访问注册页面
2. 填写注册表单（邮箱、密码等）
3. 系统验证表单数据
4. 创建用户账户和默认团队
5. 生成JWT会话令牌
6. 重定向到仪表板

### 订阅流程

1. 用户访问定价页面
2. 选择订阅计划
3. 系统创建Stripe结账会话
4. 用户完成Stripe支付流程
5. Stripe回调更新订阅信息
6. 用户获得相应的功能和权限

### API密钥管理流程

1. 用户访问API密钥管理页面
2. 创建新的API密钥
3. 系统生成密钥并存储
4. 用户可以查看、复制和撤销密钥
5. 系统记录API密钥的使用情况

## 环境设置

项目需要以下环境变量：

- `POSTGRES_URL`: PostgreSQL数据库连接URL
- `STRIPE_SECRET_KEY`: Stripe密钥
- `STRIPE_WEBHOOK_SECRET`: Stripe Webhook密钥
- `AUTH_SECRET`: JWT认证密钥
- `BASE_URL`: 应用基础URL

可以使用`lib/db/setup.ts`脚本自动设置这些环境变量。

## 部署指南

1. 克隆代码库
2. 安装依赖: `npm install`
3. 设置环境变量
4. 运行数据库迁移: `npm run db:migrate`
5. 初始化数据: `npm run db:seed`
6. 构建应用: `npm run build`
7. 启动应用: `npm start`

## 扩展建议

1. **国际化**: 添加多语言支持
2. **更多支付方式**: 集成更多支付提供商
3. **高级分析**: 添加用户行为和使用情况分析
4. **电子邮件通知**: 集成电子邮件服务
5. **双因素认证**: 增强安全性
