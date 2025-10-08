#!/bin/bash

# E2E Test Runner Script for Sunlighten - Partner Storage
# This script sets up the test environment and runs Playwright tests

set -e  # Exit on any error

echo "🚀 Starting E2E Test Suite for Sunlighten - Partner Storage"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
else
    print_status "Dependencies already installed"
fi

# Check if Playwright is installed
if ! npx playwright --version &> /dev/null; then
    print_status "Installing Playwright..."
    npx playwright install
    print_success "Playwright installed"
else
    print_status "Playwright already installed"
fi

# Check if database is running
print_status "Checking database connection..."
if ! npm run db:setup &> /dev/null; then
    print_warning "Database setup failed. Please ensure PostgreSQL is running."
    print_status "Attempting to continue with tests..."
else
    print_success "Database connection verified"
fi

# Seed test data
print_status "Seeding test data..."
if npm run db:seed &> /dev/null; then
    print_success "Test data seeded"
else
    print_warning "Test data seeding failed. Tests may not work correctly."
fi

# Parse command line arguments
TEST_MODE="headless"
BROWSER="all"
TEST_FILE=""
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --ui)
            TEST_MODE="ui"
            shift
            ;;
        --headed)
            TEST_MODE="headed"
            shift
            ;;
        --debug)
            TEST_MODE="debug"
            shift
            ;;
        --browser)
            BROWSER="$2"
            shift 2
            ;;
        --file)
            TEST_FILE="$2"
            shift 2
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --ui          Run tests with Playwright UI"
            echo "  --headed      Run tests in headed mode (visible browser)"
            echo "  --debug       Run tests in debug mode"
            echo "  --browser     Run tests for specific browser (chromium, firefox, webkit)"
            echo "  --file        Run specific test file"
            echo "  --verbose     Enable verbose output"
            echo "  --help        Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                           # Run all tests in headless mode"
            echo "  $0 --ui                     # Run tests with UI"
            echo "  $0 --headed                 # Run tests with visible browser"
            echo "  $0 --browser chromium       # Run tests only in Chromium"
            echo "  $0 --file auth.spec.ts      # Run only authentication tests"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Build the test command
TEST_CMD="npx playwright test"

if [ "$TEST_MODE" = "ui" ]; then
    TEST_CMD="$TEST_CMD --ui"
elif [ "$TEST_MODE" = "headed" ]; then
    TEST_CMD="$TEST_CMD --headed"
elif [ "$TEST_MODE" = "debug" ]; then
    TEST_CMD="$TEST_CMD --debug"
fi

if [ "$BROWSER" != "all" ]; then
    TEST_CMD="$TEST_CMD --project=$BROWSER"
fi

if [ -n "$TEST_FILE" ]; then
    TEST_CMD="$TEST_CMD $TEST_FILE"
fi

if [ "$VERBOSE" = true ]; then
    TEST_CMD="$TEST_CMD --reporter=list"
fi

# Start the application in the background
print_status "Starting application..."
npm run dev &
APP_PID=$!

# Wait for application to start
print_status "Waiting for application to start..."
sleep 10

# Check if application is running
if ! curl -s http://localhost:3000 > /dev/null; then
    print_error "Application failed to start on port 3000"
    kill $APP_PID 2>/dev/null || true
    exit 1
fi

print_success "Application started successfully"

# Run the tests
print_status "Running E2E tests..."
echo "Command: $TEST_CMD"
echo ""

# Run tests and capture exit code
if eval $TEST_CMD; then
    print_success "All tests passed! 🎉"
    EXIT_CODE=0
else
    print_error "Some tests failed! ❌"
    EXIT_CODE=1
fi

# Clean up
print_status "Cleaning up..."
kill $APP_PID 2>/dev/null || true

# Show test results
if [ -d "playwright-report" ]; then
    print_status "Test report generated: playwright-report/index.html"
fi

if [ -d "test-results" ]; then
    print_status "Test results saved in: test-results/"
fi

echo ""
echo "=========================================================="
if [ $EXIT_CODE -eq 0 ]; then
    print_success "E2E Test Suite completed successfully!"
else
    print_error "E2E Test Suite completed with failures!"
fi
echo "=========================================================="

exit $EXIT_CODE
