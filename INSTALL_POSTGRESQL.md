# PostgreSQL Installation Guide

Choose your operating system and follow the installation steps.

## macOS (Using Homebrew)

### Step 1: Install PostgreSQL
```bash
brew install postgresql@16
```

### Step 2: Start PostgreSQL Service
```bash
brew services start postgresql@16
```

### Step 3: Verify Installation
```bash
psql --version
psql -U postgres -c "SELECT 1"
```

### Step 4: Create Database and User
```bash
createdb saas_db
psql -U postgres -d postgres -c "CREATE USER postgres WITH PASSWORD 'postgres';"
psql -U postgres -d postgres -c "ALTER USER postgres CREATEDB;"
```

---

## Ubuntu / Debian (Linux)

### Step 1: Update Package Manager
```bash
sudo apt update
sudo apt upgrade -y
```

### Step 2: Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
```

### Step 3: Start PostgreSQL Service
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 4: Verify Installation
```bash
psql --version
sudo -u postgres psql -c "SELECT 1"
```

### Step 5: Create Database
```bash
sudo -u postgres createdb saas_db
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
sudo -u postgres psql -c "ALTER USER postgres CREATEDB;"
```

---

## Windows

### Step 1: Download PostgreSQL Installer
1. Visit: https://www.postgresql.org/download/windows/
2. Download PostgreSQL 16 installer
3. Run the installer

### Step 2: Run Installation Wizard
- Choose Installation Directory (default is fine)
- Enter Password for postgres user: `postgres`
- Port: `5432` (default)
- Locale: Your preference
- Click "Install"

### Step 3: Verify Installation
Open Command Prompt or PowerShell:
```bash
psql --version
psql -U postgres -c "SELECT 1"
```

When prompted, enter password: `postgres`

### Step 4: Create Database
```bash
psql -U postgres -c "CREATE DATABASE saas_db;"
```

---

## Docker (All Platforms)

If you prefer containerized PostgreSQL:

### Step 1: Install Docker
- https://www.docker.com/products/docker-desktop

### Step 2: Run PostgreSQL Container
```bash
docker run --name saas-starter-db \
  -e POSTGRES_DB=saas_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### Step 3: Verify Connection
```bash
docker exec saas-starter-db psql -U postgres -d saas_db -c "SELECT 1"
```

---

## Verify PostgreSQL is Running

### Check Service Status

**macOS:**
```bash
brew services list | grep postgresql
```

**Ubuntu/Debian:**
```bash
sudo systemctl status postgresql
```

**Windows (Check running services):**
```bash
Get-Service postgresql*
```

**Docker:**
```bash
docker ps | grep postgres
```

### Test Connection

```bash
# Connect to PostgreSQL
psql -U postgres -h localhost -d postgres -c "SELECT version();"
```

---

## Update .env.local

Once PostgreSQL is installed and running, update your `.env.local`:

```bash
cat > .env.local << 'EOF'
# Database Connection
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/saas_db

# Stripe (get test keys from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# Application
BASE_URL=http://localhost:3001
AUTH_SECRET=your-super-secret-key-change-in-production
EOF
```

---

## Run Database Migrations

Once PostgreSQL is set up and `.env.local` is configured:

```bash
# Generate migrations (if needed)
pnpm db:generate

# Run migrations
pnpm db:migrate

# Optionally seed test data
pnpm db:seed
```

---

## Troubleshooting

### Connection Refused
```bash
# Check if PostgreSQL is running
psql -U postgres -h localhost -d postgres -c "SELECT 1"

# If connection fails, restart PostgreSQL
# macOS:
brew services restart postgresql@16

# Ubuntu/Debian:
sudo systemctl restart postgresql

# Windows: Restart the PostgreSQL service via Services app
```

### Port Already in Use
```bash
# Find process using port 5432
# macOS/Linux:
lsof -i :5432

# Windows:
netstat -ano | findstr :5432

# Change port in .env.local:
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/saas_db
```

### Permission Denied
```bash
# Ubuntu/Debian: Add current user to postgres group
sudo usermod -aG postgres $USER
newgrp postgres
```

### Cannot Find psql Command
```bash
# macOS: Add to PATH
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Ubuntu: psql should be in PATH automatically

# Windows: Add to PATH manually via System Environment Variables
C:\Program Files\PostgreSQL\16\bin
```

---

## Verify Database is Ready

```bash
# Test migration compatibility
pnpm exec tsc --noEmit

# Start dev server
pnpm dev --turbopack

# Open http://localhost:3001
```

---

## Quick Setup Script

Run everything at once (macOS/Linux):

```bash
#!/bin/bash

# Install PostgreSQL (macOS)
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb saas_db

# Update .env.local
cat > .env.local << 'EOF'
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/saas_db
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
BASE_URL=http://localhost:3001
AUTH_SECRET=your-super-secret-key
EOF

# Run migrations
pnpm db:migrate

# Optional: Seed test data
pnpm db:seed

echo "✅ PostgreSQL setup complete!"
```

Save as `install-postgres.sh`, then run:
```bash
chmod +x install-postgres.sh
./install-postgres.sh
```
