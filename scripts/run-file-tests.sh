#!/bin/bash

# File Upload/Download Test Runner
# This script runs the file upload and download tests with proper cleanup

echo "🧪 Running File Upload/Download Tests..."

# Set environment variables
export USE_LOCAL_S3=true
export DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"

# Check if LocalStack is running
echo "📋 Checking LocalStack status..."
if ! curl -s http://localhost:4566 > /dev/null; then
    echo "❌ LocalStack is not running. Please start it first:"
    echo "   localstack start -d"
    exit 1
fi

# Check if database is running
echo "📋 Checking database status..."
if ! pg_isready -h localhost -p 54322 -U postgres > /dev/null 2>&1; then
    echo "❌ Database is not running. Please start it first:"
    echo "   docker-compose up -d"
    exit 1
fi

# Check if app is running
echo "📋 Checking app status..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ App is not running. Please start it first:"
    echo "   USE_LOCAL_S3=true npm run dev"
    exit 1
fi

echo "✅ All services are running"

# Run the tests
echo "🚀 Running Playwright tests..."
npx playwright test tests/file-upload-download.spec.ts --reporter=html

# Check test results
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed. Check the report for details."
    exit 1
fi

echo "🧹 Test cleanup completed"
