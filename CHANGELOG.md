# Changelog

## [Unreleased]

## [0.1.0] - 2025-03-07

### Fixed

#### Database Connection Issues
- Fixed the database host: Updated the `POSTGRES_HOST` in both `.env` and `.env.local` to use the correct Supabase database host format: `db.xxxxx.supabase.co`.
- Improved SSL configuration: Modified the SSL configuration in both `drizzle.ts` and `drizzle.config.ts` to handle self-signed certificates by setting `rejectUnauthorized: false`.
- Enhanced environment variable loading: Updated both `drizzle.ts` and `drizzle.config.ts` to load environment variables from both `.env` and `.env.local` files, with `.env.local` taking precedence.

#### TypeScript Errors
- Fixed TypeScript errors in `seed.ts` by properly typing the `db` variable in `drizzle.ts`.
- Added proper type definitions for the database client and connection.

#### Seed Script Improvements
- Made the seed script more robust: Modified the seed script to check if users and teams already exist before trying to create them, preventing duplicate key errors.
- Added Stripe error handling: Added error handling for Stripe API calls in the seed script to gracefully handle missing or invalid API keys.

### Summary
These changes have successfully fixed the database connection issues, and both the migration and seed scripts are now working correctly. The TypeScript errors have also been resolved, providing better type safety and IDE support. 