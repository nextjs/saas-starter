# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js SaaS starter application with authentication, Stripe payments, and team management functionality. It uses TypeScript, Tailwind CSS, Drizzle ORM with PostgreSQL, and includes comprehensive user/team RBAC.

## Development Commands

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production application
- `pnpm start` - Start production server
- `pnpm db:setup` - Setup environment variables (creates .env file)
- `pnpm db:generate` - Generate Drizzle schema migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database with test data (creates test@test.com/admin123)
- `pnpm db:studio` - Open Drizzle Studio for database management

## Architecture Overview

### Route Structure
- **App Router**: Uses Next.js 13+ App Router with TypeScript
- **Route Groups**: `(dashboard)` for authenticated dashboard pages, `(login)` for auth pages
- **Protected Routes**: All `/dashboard/*` routes require authentication via middleware

### Authentication & Authorization
- **Session Management**: JWT tokens stored in HTTP-only cookies, managed in `lib/auth/session.ts`
- **Middleware**: Global middleware in `middleware.ts` protects `/dashboard` routes and refreshes sessions
- **RBAC**: Role-based access with Owner/Member roles for teams
- **Action Helpers**: Use `validatedActionWithUser()` and `withTeam()` wrappers for server actions

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL
- **Schema**: Located in `lib/db/schema.ts` with proper relations
- **Key Tables**: users, teams, teamMembers, invitations, activityLogs
- **Queries**: Centralized database queries in `lib/db/queries.ts`

### Payment Integration
- **Stripe**: Full integration with subscriptions, webhooks, and customer portal
- **Webhooks**: Handle subscription events at `/api/stripe/webhook`
- **Test Data**: Use card 4242424242424242 for testing

### Key Patterns
- **Server Actions**: Use validation middleware (`validatedAction`, `validatedActionWithUser`)
- **Type Safety**: Leverage Drizzle's inferred types for database operations
- **Activity Logging**: Track user actions using ActivityType enum
- **Team Context**: Most operations require team membership validation

### Important Files
- `middleware.ts` - Global authentication middleware
- `lib/auth/middleware.ts` - Server action validation helpers
- `lib/db/schema.ts` - Database schema with relations
- `lib/db/queries.ts` - Centralized database operations
- `lib/payments/stripe.ts` - Stripe configuration and helpers

## Development Setup Requirements

1. Run `pnpm db:setup` to create .env file
2. Configure PostgreSQL database
3. Run `pnpm db:migrate` and `pnpm db:seed`
4. For Stripe testing, use `stripe listen --forward-to localhost:3000/api/stripe/webhook`

## Key Dependencies
- Next.js 15 with App Router and Turbopack
- Drizzle ORM with PostgreSQL
- Stripe for payments
- Radix UI components
- Tailwind CSS for styling
- Zod for validation
- JOSE for JWT tokens