# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Installation & Setup
```bash
pnpm install              # Install dependencies
pnpm db:setup            # Create .env file with database setup
pnpm db:migrate          # Run database migrations
pnpm db:seed             # Seed database with default test user (test@test.com / admin123)
```

### Running the Application
```bash
pnpm dev                 # Start development server with Turbopack
pnpm build               # Build for production
pnpm start               # Start production preview server
```

### Database Development
```bash
docker compose up postgres    # Start PostgreSQL container (required for local development)
pnpm db:generate             # Generate Drizzle migrations from schema changes
pnpm db:migrate              # Apply pending migrations
pnpm db:studio               # Open Drizzle Studio browser UI for database inspection
```

### Stripe & Payments Testing
```bash
stripe login                              # Authenticate with Stripe account
stripe listen --forward-to localhost:3000/api/stripe/webhook  # Forward webhook events locally
```

Test card: `4242 4242 4242 4242` (any future expiry, any CVC)

### Linting
```bash
pnpm exec next lint       # Check TypeScript and linting issues
pnpm exec next lint --fix # Auto-fix issues where possible
```

## Architecture Overview

### Route Structure
- **`app/(login)/`**: Public routes for marketing, sign-in, and sign-up. Handled by `login.tsx` which wraps route groups.
- **`app/(dashboard)/`**: Protected routes accessible only after authentication. Middleware redirects unauthenticated users to `/sign-in`.
- **`app/api/`**: Server API routes for user/team operations and Stripe webhook handling.

### Authentication Flow
1. **Session Management** (`lib/auth/session.ts`):
   - JWT-based sessions stored in `httpOnly` cookies
   - Token signing with HS256 algorithm using `AUTH_SECRET`
   - 24-hour session expiration
   - Password hashing with bcryptjs (10 salt rounds)

2. **Middleware** (`middleware.ts`):
   - Global route protection: redirects `/dashboard` routes to sign-in if no session
   - Auto-refreshes session tokens on GET requests to extend 24-hour window

3. **Server Actions** (`lib/auth/middleware.ts`):
   - `validatedAction()`: Schema validation for form submissions
   - `validatedActionWithUser()`: Same validation plus user authentication check
   - `withTeam()`: Ensures action has access to authenticated user's team

### Database Layer
- **ORM**: Drizzle with PostgreSQL
- **Schema** (`lib/db/schema.ts`):
  - `users`: User accounts (email/password-based)
  - `teams`: Organizations (can have multiple members)
  - `teamMembers`: Join table linking users to teams with roles
  - `activityLogs`: Audit trail of user actions (login, signup, team changes, etc.)
  - `invitations`: Pending team invitations
  - `articles`, `categories`, `tags`: CMS/content tables with relationships

- **Query Helpers** (`lib/db/queries.ts`):
  - `getUser()`: Retrieves authenticated user from session cookie
  - `getTeamForUser()`: Gets first team for current user (assuming one team per user in this starter)
  - `getActivityLogs()`: Fetches user's recent activity
  - Stripe integration queries for subscription management

### Payment Integration
- **Provider**: Stripe (checkout sessions, billing portal, subscriptions)
- **Key Functions** (`lib/payments/stripe.ts`):
  - `createCheckoutSession()`: Initiates subscription checkout flow
  - `createCustomerPortalSession()`: Opens Stripe billing portal
  - `handleSubscriptionChange()`: Webhook handler for subscription updates
  - `getStripePrices()` / `getStripeProducts()`: Fetch pricing from Stripe dashboard

- **Webhook Handling** (`app/api/stripe/webhook/route.ts`):
  - Listens for `customer.subscription.updated` and `customer.subscription.deleted` events
  - Syncs subscription state back to the database

### UI Components
- **`components/ui/`**: Reusable shadcn/ui components (buttons, forms, modals, etc.)
- **Styling**: Tailwind CSS v4 with responsive utilities
- **Dynamic Content**: Client-side SWR for data fetching where needed

## Key Patterns & Conventions

### File Organization
- Components exporting JSX: `PascalCase` (e.g., `UserProfile.tsx`)
- Utility functions and hooks: `camelCase` (e.g., `useUser.ts`)
- Server Actions and API routes: colocated near feature (e.g., `app/dashboard/actions.ts`)
- Import paths: Always use `@/` alias (configured in `tsconfig.json`)

### Server Actions vs API Routes
- **Server Actions** (`.tsx` files with `'use server'`): Use for form submissions, team operations, prefer when CSRF protection is automatic
- **API Routes** (`app/api/*/route.ts`): Use for webhooks, third-party integrations, public endpoints

### Activity Logging
- Defined in `lib/db/schema.ts` as `ActivityType` enum
- Log all user events (signin, signup, team changes, etc.) via `logActivity()` in actions
- Used for audit trails and security monitoring

### Stripe Integration Points
- Always check `team.stripeCustomerId` before creating customer portal sessions
- Subscription status is stored in `teams.subscriptionStatus` (synced via webhooks)
- Test mode uses Stripe test keys; production requires live keys in environment

## Security Considerations

1. **Environment Variables** (set via `pnpm db:setup` or manually):
   - `AUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`: From Stripe dashboard
   - `POSTGRES_URL`: Database connection string
   - `BASE_URL`: Application domain (used for redirects after Stripe checkout)

2. **Protected Routes**:
   - All `/dashboard` routes require valid session cookie
   - Server Actions can call `getUser()` or `getTeamForUser()` to enforce auth
   - Middleware automatically handles route protection

3. **Form Validation**:
   - Use Zod schemas in server actions to validate user input
   - Validation failures return error messages without exposing internals

4. **Secrets Management**:
   - Never commit `.env.local` or credentials
   - Store all secrets in `.env` (created by `pnpm db:setup`)
   - Vercel: Set environment variables in project settings for production

## Testing Strategy

Manual testing is the current approach:
- Document in PR body: screens tested, API calls exercised, database operations verified
- Test with Stripe test card during payment flows
- Verify activity logs appear after user actions
- Check team member CRUD operations work with proper role validation

If adding automated tests:
- Use Vitest + React Testing Library (after confirming with maintainers)
- Colocate tests next to features (e.g., `component.test.tsx`)
- Prioritize: data layer (`lib/db/`), payment flows, auth middleware

## Deployment Notes

### Vercel Deployment
1. Push code to GitHub
2. Connect repo in Vercel dashboard
3. Set environment variables:
   - `BASE_URL`: Production domain (e.g., `https://yourdomain.com`)
   - `AUTH_SECRET`: Same as local or generate new one
   - `STRIPE_SECRET_KEY`: Production Stripe key
   - `STRIPE_WEBHOOK_SECRET`: Production webhook secret
   - `POSTGRES_URL`: Production database URL

4. Create production Stripe webhook endpoint pointing to `/api/stripe/webhook`
5. Vercel automatically runs `next build` and `next start`

### Environment-Specific Behavior
- Stripe: Test mode keys for development, live keys for production
- Database: Docker Postgres locally, managed database in production
- Cookies: `secure: true` forces HTTPS in production (automatic via Next.js)

## Important Files Reference

- `middleware.ts`: Global auth middleware
- `lib/auth/session.ts`: JWT/session management
- `lib/db/schema.ts`: All database tables and relationships
- `lib/db/queries.ts`: Core data access functions
- `lib/db/drizzle.ts`: Database connection setup
- `lib/payments/stripe.ts`: Stripe integration
- `app/(login)/actions.ts`: Authentication server actions
- `.env.example`: Template for required environment variables
