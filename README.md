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

Payments are disabled by default. Stripe credentials and the Stripe CLI are not
needed to build the app, create accounts, or use the Postgres-backed dashboard.
Copy the environment example and configure your development database, base URL,
and a randomly generated authentication secret:

```bash
cp .env.example .env
openssl rand -hex 32
```

Set `POSTGRES_URL`, `BASE_URL`, and `AUTH_SECRET` in `.env`, and keep
`PAYMENTS_ENABLED=false`. Start your Postgres instance, then run the migrations:

```bash
pnpm db:migrate
```

Create an account through `/sign-up`, or optionally seed a local demo user/team:

```bash
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

The disabled mode hides pricing navigation and subscription controls. `/pricing`
shows an unavailable message, checkout and webhook endpoints return HTTP 503,
and payment server actions redirect to the unavailable pricing page. Setting
only a Stripe key cannot enable payments: both `PAYMENTS_ENABLED=true` and a
nonempty `STRIPE_SECRET_KEY` are required. Webhooks additionally require
`STRIPE_WEBHOOK_SECRET`. Do not opt in for the community prototype.

The interactive `pnpm db:setup` helper is intended for Stripe-enabled setups;
use the manual `.env` steps above for development without payments. Seeding is
optional and not idempotent; it skips Stripe products and prices when disabled.

Validate the app with:

```bash
pnpm build
pnpm exec tsc --noEmit
node --test tests/payments-config.test.mjs
# After pnpm build, with pnpm start running locally and payments disabled:
TEST_BASE_URL=http://127.0.0.1:3000 node --test tests/payments-disabled.test.mjs
```

The Node test commands use native TypeScript loading (Node 22.18+ or Node 24).

In Codex Cloud, if Turbopack needs the platform's trusted proxy certificates,
set `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` for build and dev commands.
Allow `fonts.googleapis.com` and `fonts.gstatic.com` for the Google Font download.
Keep TLS verification enabled.

## Optional Stripe integration

For a separately authorized payment integration, the original Stripe CLI webhook
forwarding command is:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Testing Payments

Only when payments have deliberately been enabled with Stripe test credentials,
use the following test card details:

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

### Add environment variables

In your Vercel project settings (or during deployment), add all the necessary environment variables. Make sure to update the values for the production environment, including:

1. `BASE_URL`: Set this to your production domain.
2. `PAYMENTS_ENABLED`: Keep `false` to leave all payments disabled. Enabling payments is a separate integration step.
3. `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`: Optional when payments are disabled; configure only for an intentionally enabled Stripe integration.
4. `POSTGRES_URL`: Set this to your production database URL.
5. `AUTH_SECRET`: Set this to a random string. `openssl rand -base64 32` will generate one.

## Other Templates

While this template is intentionally minimal and to be used as a learning resource, there are other paid versions in the community which are more full-featured:

- https://achromatic.dev
- https://shipfa.st
- https://makerkit.dev
- https://zerotoshipped.com
- https://turbostarter.dev
