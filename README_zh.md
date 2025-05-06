# MCP SaaS Kit模板

一个现代化的SaaS应用程序启动模板，基于**Next.js 15.4.0-canary.9**构建，集成了用户认证、团队管理、Stripe支付和活动日志等核心功能。专为快速开发和部署而设计，助您在短时间内构建专业级SaaS产品。

**演示: [https://mcp.day/](https://mcp.day/)**
*测试账户: 1@love2.dev, 密码: love2dev*

*[English Documentation](README.md)*

## ✨ 核心功能

- **用户认证系统** - 基于JWT的安全认证，支持邮箱/密码登录
- **团队协作** - 完整的团队创建、成员邀请和权限管理
- **订阅支付** - 与Stripe无缝集成，支持多种订阅计划
- **活动日志** - 全面的用户操作记录系统，便于审计和分析
- **响应式设计** - 完美适配移动端和桌面端的现代UI
- **明暗主题** - 支持亮色/暗色主题切换，提升用户体验

## 🛠️ 技术栈

- **前端框架**: [Next.js 15.4.0-canary.9](https://nextjs.org/) - 支持App Router和React服务器组件
- **数据库**: [PostgreSQL](https://www.postgresql.org/) - 可靠的关系型数据库
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - 类型安全的现代ORM
- **UI组件**: [shadcn/ui](https://ui.shadcn.com/) - 高度可定制的组件库
- **支付处理**: [Stripe](https://stripe.com/) - 安全可靠的支付解决方案
- **样式**: [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架
- **部署**: 支持[Vercel](https://vercel.com/)一键部署

## 🚀 快速开始

### 克隆项目

```bash
git clone https://github.com/Anson2Dev/mcp-saas-kit
cd mcp-saas-kit
pnpm install
```

### 环境配置

1. **设置Stripe**

   [安装Stripe CLI](https://docs.stripe.com/stripe-cli)并登录:

   ```bash
   stripe login
   ```

2. **创建环境变量**

   运行设置脚本生成`.env`文件:

   ```bash
   cp .env.example .env
   // TODO pnpm db:setup
   ```

3. **初始化数据库**

   ```bash
   pnpm db:migrate
   // TODO pnpm db:seed
   ```

4. **启动开发服务器**

   ```bash
   pnpm dev
   ```

   访问 [http://localhost:3000](http://localhost:3000) 查看应用

5. **监听Stripe Webhook**

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

## 💳 测试支付

使用Stripe测试卡:
- 卡号: `4242 4242 4242 4242`
- 到期日: 任何未来日期
- CVC: 任何3位数字

## 🌐 生产环境部署

### 1. 配置Stripe

在Stripe仪表板创建生产环境webhook，端点设为`https://yourdomain.com/api/stripe/webhook`。

### 2. 部署到Vercel

1. 将代码推送到GitHub仓库
2. 在Vercel导入仓库并部署
3. 配置以下环境变量:
   - `POSTGRES_URL`: Supabase URL
   - `BASE_URL`: 生产域名
   - `STRIPE_SECRET_KEY`: 生产环境Stripe密钥
   - `STRIPE_WEBHOOK_SECRET`: 生产webhook密钥
   - `POSTGRES_URL`: 生产数据库URL
   - `AUTH_SECRET`: 随机字符串 (`openssl rand -base64 32`)

## 📂 项目结构

```
app/
├── (marketing)/ - 营销页面(首页、定价、博客、文档)
├── (auth)/ - 认证页面(登录、注册)
├── dashboard/ - 仪表板页面(概览、团队、账户、活动日志)
├── api/ - API路由(用户、团队、支付、活动)
├── lib/ - 核心库
│   ├── auth/ - 认证功能
│   ├── db/ - 数据库功能
│   └── payments/ - 支付功能
└── components/ - UI组件
```

## 🔑 项目特色

- **简洁明了的架构** - 基于Next.js App Router的清晰目录结构
- **整合的账户管理** - 将账户信息和安全设置整合在一个页面
- **完整的团队功能** - 支持团队创建、成员邀请和权限管理
- **多语言支持** - 界面和文档支持中文和英文
- **活动日志系统** - 详细记录用户操作，支持分页和筛选
- **明暗主题切换** - 支持亮色/暗色主题，自动适应系统设置

## 🔄 最近更新

- 将安全功能整合到账户页面，简化用户体验
- 优化移动端响应式布局
- 添加活动日志分页功能
- 改进团队管理界面
- 实现明暗主题切换功能
- 优化仪表板布局，移除不必要的导航元素

## 🤝 贡献

这是我第一个开源项目，所以它可能不是完美的。我需要您的贡献来让它变得更好。

如果您有任何建议或改进，请打开一个issue或提交一个pull request。

有什么疑问，请联系：anson@love2.dev

## 感谢
- Vercel saas-starter-kit
- Vibe coder: Augment & Cursor, they're contributing 90% of the code.
