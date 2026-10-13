# Next.js SaaS Starter

This is a starter template for building a SaaS application using **Next.js** with support for authentication, Stripe integration for payments, and a dashboard for logged-in users.

**Demo: [https://next-saas-start.vercel.app/](https://next-saas-start.vercel.app/)**

## Features

- Marketing landing page (`/`) with animated Terminal element
- Pricing page (`/pricing`) which connects to Stripe Checkout
- Dashboard pages with CRUD operations on users/teams
- Basic RBAC with Owner and Member roles
- Subscription management with Stripe Customer Portal
- Google and Facebook authentication using NextAuth
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

Use the included setup script to create your `.env` file:

```bash
pnpm db:setup
```

Run the database migrations and seed the database with a default user and team:

```bash
pnpm db:migrate
pnpm db:seed
```

The seeded user and team are sample data. The seeded test account is marked
verified for local development; new email/password accounts must verify using
the link sent to their signup address.

Configure Google and Facebook OAuth credentials plus Mailgun email settings in
`.env` before signing in. Email/password signup requires following the
verification link sent to the signup address.

Finally, run the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

You can listen for Stripe webhooks locally through their CLI to handle subscription change events:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## STL Quote Requests

The STL estimator can email the quote details and a ZIP archive of the uploaded
model to `quotes@lastlayer.ca` through Mailgun. Configure these server-side
environment variables in `.env.local` for local development and in your
deployment settings for production:

- `MAILGUN_API_KEY`: a private Mailgun API key.
- `MAILGUN_DOMAIN`: a sending domain configured in Mailgun.
- `MAILGUN_FROM_EMAIL`: a verified sender address for that domain.
- `MAILGUN_API_BASE_URL`: optional; defaults to `https://api.mailgun.net`. Use
  `https://api.eu.mailgun.net` for an EU Mailgun account.

Quote requests require a project name, a requested print date, and an STL file
no larger than 20 MB. The signed-in account's name and email are included
automatically. STL analysis and estimate calculations run on the server;
submitting a quote requires an authenticated Google, Facebook, or verified
email account. The STL is emailed to the quotes address only when the user
submits the quote form. Never expose the Mailgun API key in client-side code
or commit it to the repository.

## Authentication

Set `NEXTAUTH_URL` and `NEXTAUTH_SECRET`, then configure `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID`, and `FACEBOOK_CLIENT_SECRET`.
NextAuth's Upstash Redis adapter uses the Vercel Upstash integration variables
`KV_REST_API_URL` and `KV_REST_API_TOKEN` (or the corresponding
`SASSStarter_KV_REST_API_URL` and `SASSStarter_KV_REST_API_TOKEN` names already
provided in this project's environment). Point these at the
`upstash-kv-beige-grass` database; NextAuth stores provider users and account
records there using its own key prefix.
Configure Mailgun as described above to deliver signup verification links.
Register the callback URL `https://your-domain/api/auth/callback/google` with
Google and `https://your-domain/api/auth/callback/facebook` with Facebook.
For local development, use `http://localhost:3000/api/auth/callback/google`
and `http://localhost:3000/api/auth/callback/facebook`.
Run `pnpm db:migrate` to add the verified-email and signup-token database
fields before deploying the email signup flow.
NextAuth sessions continue to use signed JWT cookies because the email/password
Credentials provider requires JWT sessions. The adapter stores NextAuth OAuth
users and provider-account records in Upstash; the app's teams, profile, and
email-verification records remain in Postgres.

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

### Add environment variables

In your Vercel project settings (or during deployment), add all the necessary environment variables. Make sure to update the values for the production environment, including:

1. `BASE_URL`: Set this to your production domain.
2. `STRIPE_SECRET_KEY`: Use your Stripe secret key for the production environment.
3. `STRIPE_WEBHOOK_SECRET`: Use the webhook secret from the production webhook you created in step 1.
4. `POSTGRES_URL`: Set this to your production database URL.
5. `NEXTAUTH_SECRET`: Set this to a random string. `openssl rand -base64 32` will generate one.
6. Configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID`, and `FACEBOOK_CLIENT_SECRET`.

## Other Templates

While this template is intentionally minimal and to be used as a learning resource, there are other paid versions in the community which are more full-featured:

- https://achromatic.dev
- https://shipfa.st
- https://makerkit.dev
- https://zerotoshipped.com
- https://turbostarter.dev
