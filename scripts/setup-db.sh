#!/bin/bash

# Database Setup Script
# This script helps set up the PostgreSQL database for local development

set -e

echo "🚀 SaaS Starter - Database Setup"
echo "=================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found!"
    echo "Please create .env.local with database connection details."
    exit 1
fi

# Extract database URL
DB_URL=$(grep POSTGRES_URL .env.local | cut -d '=' -f 2)

if [ -z "$DB_URL" ]; then
    echo "❌ POSTGRES_URL not found in .env.local"
    exit 1
fi

echo "📦 Database Configuration"
echo "Database URL: $DB_URL"
echo ""

# Check if we can connect
echo "🔍 Testing database connection..."
if ! psql "$DB_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo "❌ Cannot connect to database"
    echo ""
    echo "Please ensure PostgreSQL is running and the connection URL is correct."
    echo ""
    echo "If using Docker, run:"
    echo "  docker-compose up -d"
    exit 1
fi

echo "✅ Database connection successful!"
echo ""

# Run migrations
echo "🔄 Running database migrations..."
pnpm db:migrate

echo ""
echo "✅ Migrations completed!"
echo ""

# Ask if user wants to seed
read -p "Do you want to seed the database with test data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    pnpm db:seed
    echo "✅ Database seeded with test data!"
    echo ""
    echo "Test credentials:"
    echo "  Email: test@test.com"
    echo "  Password: (from seed.ts)"
else
    echo "⏭️ Skipping database seed"
fi

echo ""
echo "=================================="
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the dev server: pnpm dev --turbopack"
echo "2. Open http://localhost:3001"
echo "3. Sign up or use test credentials if database was seeded"
echo ""
