# Database Setup Guide

This guide explains how to set up PostgreSQL for local development of the SaaS Starter application.

## Prerequisites

- PostgreSQL 14+ installed locally, OR
- Docker & Docker Compose installed

## Option 1: Using Docker (Recommended)

### Step 1: Start PostgreSQL Container

```bash
docker-compose up -d
```

This will:
- Start a PostgreSQL 16 container named `saas-starter-db`
- Create a database named `saas_db`
- Run on port 5432 (localhost)
- Use username: `postgres` and password: `postgres`

### Step 2: Verify Connection

```bash
docker-compose ps
```

You should see the postgres service running.

## Option 2: Local PostgreSQL Installation

### Step 1: Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### Step 2: Create Database and User

```bash
# Connect to PostgreSQL
psql -U postgres

# Run these SQL commands:
CREATE DATABASE saas_db;
CREATE USER postgres WITH PASSWORD 'postgres';
ALTER ROLE postgres SET client_encoding TO 'utf8';
ALTER ROLE postgres SET default_transaction_isolation TO 'read committed';
ALTER ROLE postgres SET default_transaction_deferrable TO on;
ALTER ROLE postgres SET default_transaction_read_only TO off;
ALTER USER postgres CREATEDB;
\q
```

## Step 3: Configure Environment Variables

Update `.env.local` with your database connection:

```
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/saas_db
```

## Step 4: Run Database Migrations

```bash
# Generate migrations (if needed)
pnpm db:generate

# Run migrations
pnpm db:migrate
```

## Step 5: Seed Database (Optional)

```bash
pnpm db:seed
```

This populates the database with test data including:
- Test users
- Sample teams
- Products and pricing

## Step 6: Access Database (Optional)

### Using Drizzle Studio (GUI)
```bash
pnpm db:studio
```

This opens a web UI at http://localhost:3001 where you can browse and edit data.

### Using psql (CLI)
```bash
psql postgresql://postgres:postgres@localhost:5432/saas_db
```

## Verification

After setup, verify everything is working:

1. **Check TypeScript compilation:**
   ```bash
   pnpm exec tsc --noEmit
   ```

2. **Start development server:**
   ```bash
   pnpm dev --turbopack
   ```

3. **Open application:**
   Navigate to http://localhost:3001

4. **Test sign-up:**
   Create a new account to verify database connectivity

## Environment Variables

Required environment variables in `.env.local`:

```
# Database Connection
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/saas_db

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
BASE_URL=http://localhost:3001
AUTH_SECRET=your-super-secret-key
```

## Troubleshooting

### Connection Refused
- Check PostgreSQL is running: `psql -U postgres -d postgres -c "SELECT 1"`
- Verify port 5432 is accessible
- Check POSTGRES_URL format in `.env.local`

### Migration Errors
- Clear `.next` folder: `rm -rf .next`
- Regenerate migrations: `pnpm db:generate`
- Check database schema: `pnpm db:studio`

### Cannot Connect with Docker
- Check container is running: `docker ps | grep postgres`
- View logs: `docker logs saas-starter-db`
- Ensure port 5432 isn't already in use

## Production Setup

For production, use:
- A managed PostgreSQL service (AWS RDS, Supabase, etc.)
- Strong, unique passwords
- SSL/TLS connections
- Regular backups
- Connection pooling

See deployment documentation for more details.
