# MCP SaaS 启动模板

这是一个用于构建SaaS应用程序的启动模板，使用**Next.js**框架，支持用户认证、Stripe支付集成以及登录用户的仪表板功能。专为快速开发和部署而设计。

**演示: [https://mcp.day/](https://mcp.day/)**

## 功能特点

- 营销登陆页面 (`/`) 带有动画终端元素展示
- 定价页面 (`/pricing`) 连接到Stripe结账系统
- 仪表板页面，支持用户/团队的CRUD操作
- 基本的RBAC权限控制，支持所有者和成员角色
- 通过Stripe客户门户进行订阅管理
- 电子邮件/密码认证，JWT存储在cookies中
- 全局中间件保护需登录的路由
- 本地中间件保护服务器操作或验证Zod模式
- 用户事件活动日志系统
- 整合的账户和安全管理页面
- 团队成员邀请和管理功能
- 响应式设计，适配移动端和桌面端

## 技术栈

- **框架**: [Next.js](https://nextjs.org/) - React框架，支持服务器组件和App Router
- **数据库**: [Postgres](https://www.postgresql.org/) - 强大的关系型数据库
- **ORM**: [Drizzle](https://orm.drizzle.team/) - 类型安全的ORM，支持TypeScript
- **支付**: [Stripe](https://stripe.com/) - 完整的支付解决方案
- **UI库**: [shadcn/ui](https://ui.shadcn.com/) - 可定制的UI组件库
- **认证**: 基于JWT的自定义认证系统
- **部署**: 支持[Vercel](https://vercel.com/)一键部署

## 开始使用

```bash
git clone https://github.com/Anson2Dev/mcp-saas-kit
cd mcp-saas-kit
pnpm install
```

## 本地运行

### 1. 设置Stripe

[安装](https://docs.stripe.com/stripe-cli) 并登录到您的Stripe账户:

```bash
stripe login
```

### 2. 环境配置

使用包含的设置脚本创建您的 `.env` 文件:

```bash
pnpm db:setup
```

### 3. 数据库初始化

运行数据库迁移并用默认用户和团队填充数据库:

```bash
pnpm db:migrate
pnpm db:seed
```

这将创建以下用户和团队:

- 用户: `test@test.com`
- 密码: `admin123`

您也可以通过 `/sign-up` 路由创建新用户。

### 4. 启动开发服务器

运行Next.js开发服务器:

```bash
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用程序。

### 5. Stripe Webhook监听

您可以通过Stripe CLI在本地监听Stripe webhook以处理订阅变更事件:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 测试支付

要测试Stripe支付，请使用以下测试卡详细信息:

- 卡号: `4242 4242 4242 4242`
- 到期日: 任何未来日期
- CVC: 任何3位数字
- 姓名: 任意
- 地址: 任意

## 生产环境部署

当您准备将SaaS应用程序部署到生产环境时，请按照以下步骤操作:

### 1. 设置生产环境Stripe webhook

1. 进入Stripe仪表板，为您的生产环境创建新的webhook。
2. 将端点URL设置为您的生产API路由（例如，`https://yourdomain.com/api/stripe/webhook`）。
3. 选择您想要监听的事件（例如，`checkout.session.completed`，`customer.subscription.updated`）。

### 2. 部署到Vercel

1. 将您的代码推送到GitHub仓库。
2. 将您的仓库连接到[Vercel](https://vercel.com/)并部署它。
3. 按照Vercel部署流程进行操作，它将指导您完成项目设置。

### 3. 添加环境变量

在Vercel项目设置（或部署期间），添加所有必要的环境变量。确保为生产环境更新以下值:

1. `BASE_URL`: 设置为您的生产域名。
2. `STRIPE_SECRET_KEY`: 使用生产环境的Stripe密钥。
3. `STRIPE_WEBHOOK_SECRET`: 使用您在第1步中创建的生产webhook的密钥。
4. `POSTGRES_URL`: 设置为您的生产数据库URL。
5. `AUTH_SECRET`: 设置为随机字符串。使用 `openssl rand -base64 32` 生成。

### 4. 数据库迁移

确保在部署前运行所有必要的数据库迁移，或设置自动迁移流程。

## 项目特色

本模板具有以下特色:

1. **简洁明了的项目结构** - 易于理解和扩展
2. **整合的账户与安全功能** - 用户可在一个页面管理所有账户相关设置
3. **响应式设计** - 完美适配移动端和桌面端
4. **中文本地化支持** - 界面和文档支持中文
5. **完整的团队管理功能** - 支持团队创建、成员邀请和权限管理
6. **用户活动日志系统** - 记录用户的所有操作活动

## 目录结构

```
app/
├── (marketing)/ - 营销相关页面
│   ├── page.tsx - 首页
│   ├── pricing/ - 定价页面
│   ├── blog/ - 博客页面
│   ├── docs/ - 文档页面
│   └── layout.tsx - 营销页面共享布局（包含 Header 和 Footer）
│
├── (auth)/ - 认证相关页面
│   ├── sign-in/ - 登录页面
│   ├── sign-up/ - 注册页面
│   ├── actions.ts - 认证相关服务器操作（登录、注册、密码更新等）
│   └── layout.tsx - 认证页面共享布局
│
├── dashboard/ - 仪表板（需登录访问）
│   ├── page.tsx - 团队管理页面
│   ├── general/ - 通用设置页面
│   ├── activity/ - 活动日志页面
│   ├── user-log/ - 用户活动日志页面
│   ├── account/ - 账户设置页面（包含账户信息和安全设置）
│   ├── team/ - 团队管理页面
│   └── layout.tsx - 仪表板专用布局（无 Header 和 Footer）
│
├── api/ - API 路由
│   ├── user/ - 用户相关 API
│   ├── team/ - 团队相关 API
│   └── stripe/ - 支付相关 API
│
├── lib/ - 工具库和辅助函数
│   ├── auth/ - 认证相关功能
│   ├── db/ - 数据库相关功能
│   │   ├── schema.ts - 数据库模式定义
│   │   ├── queries.ts - 常用数据库查询
│   │   └── drizzle.ts - Drizzle ORM配置
│   └── payments/ - 支付相关功能
│
├── components/ - 可复用组件
│   ├── ui/ - 基础UI组件
│   └── app-sidebar.tsx - 应用侧边栏组件
│
└── layout.tsx - 全局根布局（基础结构，不包含 Header 和 Footer）
```

## 最近更新

- 将安全功能整合到账户页面，简化用户体验
- 优化移动端响应式布局
- 添加中文本地化支持
- 改进团队管理功能
- 完善用户活动日志系统