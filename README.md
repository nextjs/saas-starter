# Next.js SaaS Starter

This is a starter template for building a SaaS application using **Next.js** with support for authentication, Stripe integration for payments, and a dashboard for logged-in users.

**Demo: [https://next-saas-start.vercel.app/](https://next-saas-start.vercel.app/)**

## Features

- Marketing landing page (`/`) with animated Terminal element
- Pricing page (`/pricing`) which connects to Stripe Checkout
- Dashboard pages with CRUD operations on users/teams
- Basic RBAC with Owner and Member roles
- Subscription management with Stripe Customer Portal
- Email/password authentication with JWTs stored to cookies
- Global middleware to protect logged-in routes
- Local middleware to protect Server Actions or validate Zod schemas
- Activity logging system for any user events

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [Postgres](https://www.postgresql.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Payments**: [Stripe](https://stripe.com/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

```bash
git clone https://github.com/nextjs/saas-starter
cd saas-starter
pnpm install
```

## Running Locally

[Install](https://docs.stripe.com/stripe-cli) and log in to your Stripe account:

```bash
stripe login
```

去vercel上面申请了neon-green-chair免费版的数据库，并尝试建立本地连接，方便下一步部署

Use the included setup script to create your `.env` file:

```bash
pnpm db:setup
```

```bash
pnpm db:setup

> @ db:setup C:\Users\FX\IdeaProjects\fx-saas
> npx tsx lib/db/setup.ts

Step 1: Checking if Stripe CLI is installed and authenticated...
Stripe CLI is installed.
Stripe CLI is authenticated.
Step 2: Setting up Postgres
Do you want to use a local Postgres instance with Docker (L) or a remote Postgres instance (R)? (L/R): R  选择R远程数据库
You can find Postgres databases at: https://vercel.com/marketplace?category=databases
Enter your POSTGRES_URL: 去vercel上面申请了neon-green-chair免费版的数据库，并尝试建立本地连接
Step 3: Getting Stripe Secret Key
You can find your Stripe Secret Key at: https://dashboard.stripe.com/test/apikeys
Enter your Stripe Secret Key: 去该网站申请测试KEY https://dashboard.stripe.com/acct_1SIrbsICXUfDaKJj/test/apikeys
Step 4: Creating Stripe webhook...
Stripe webhook created.
Step 5: Generating AUTH_SECRET...
Stripe webhook created.
Step 5: Generating AUTH_SECRET...
Step 6: Writing environment variables to .env
.env file created with the necessary variables.
🎉 Setup completed successfully!
Step 6: Writing environment variables to .env
.env file created with the necessary variables.
🎉 Setup completed successfully!
🎉 Setup completed successfully!
```
Run the database migrations and seed the database with a default user and team:

```bash
pnpm db:migrate
pnpm db:seed
```

This will create the following user and team:

- User: `test@test.com`
- Password: `admin123`

You can also create new users through the `/sign-up` route.

Finally, run the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

You can listen for Stripe webhooks locally through their CLI to handle subscription change events:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

登录 Stripe Dashboard
👉 https://dashboard.stripe.com/test/webhooks

点击「+ Add endpoint」

输入你的 Webhook 地址，例如：

https://fx-saas.vercel.app/api/stripe/webhook


选择要监听的事件（例如 checkout.session.completed, invoice.paid 等）
创建成功后，页面会显示一个类似：

whsec_live_xxx


的 Signing secret

将它填入线上环境变量（Vercel 的 Dashboard → Project → Settings → Environment Variables）：

STRIPE_WEBHOOK_SECRET=whsec_live_xxx

## Testing Payments

To test Stripe payments, use the following test card details:

- Card Number: `4242 4242 4242 4242`
- Expiration: Any future date
- CVC: Any 3-digit number

## Going to Production

When you're ready to deploy your SaaS application to production, follow these steps:

### Set up a production Stripe webhook

1. Go to the Stripe Dashboard and create a new webhook for your production environment.
2. Set the endpoint URL to your production API route (e.g., `https://yourdomain.com/api/stripe/webhook`).
3. Select the events you want to listen for (e.g., `checkout.session.completed`, `customer.subscription.updated`).

### Deploy to Vercel

1. Push your code to a GitHub repository.
2. Connect your repository to [Vercel](https://vercel.com/) and deploy it.
3. Follow the Vercel deployment process, which will guide you through setting up your project.

进入 Vercel 项目的 Settings → Environment Variables建立环境变量，导入本地env文件即可

### Add environment variables

In your Vercel project settings (or during deployment), add all the necessary environment variables. Make sure to update the values for the production environment, including:

1. `BASE_URL`: Set this to your production domain.
2. `STRIPE_SECRET_KEY`: Use your Stripe secret key for the production environment.
3. `STRIPE_WEBHOOK_SECRET`: Use the webhook secret from the production webhook you created in step 1.
4. `POSTGRES_URL`: Set this to your production database URL.
5. `AUTH_SECRET`: Set this to a random string. `openssl rand -base64 32` will generate one.

## Other Templates

While this template is intentionally minimal and to be used as a learning resource, there are other paid versions in the community which are more full-featured:

- https://achromatic.dev
- https://shipfa.st
- https://makerkit.dev
- https://zerotoshipped.com
- https://turbostarter.dev
