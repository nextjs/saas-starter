# E2E Test Suite

This directory contains comprehensive end-to-end tests for the Sunlighten - Partner Storage using Playwright.

## Test Structure

```
tests/
├── README.md                 # This file
├── global-setup.ts          # Global test setup
├── global-teardown.ts       # Global test cleanup
├── auth.spec.ts             # Authentication tests
├── dashboard.spec.ts        # Dashboard functionality tests
├── spaces.spec.ts           # Spaces management tests
├── file-upload.spec.ts      # File upload tests
├── api-integration.spec.ts  # API integration tests
├── fixtures/                # Test fixtures and data
├── utils/                   # Test utilities and helpers
│   ├── test-data.ts         # Test data definitions
│   ├── auth-helpers.ts      # Authentication helper functions
│   └── file-helpers.ts      # File upload/download helpers
└── pages/                   # Page object models (future)
```

## Test Categories

### 1. Authentication Tests (`auth.spec.ts`)
- Login/logout functionality
- Form validation
- Route protection
- User role-based access
- Session management

### 2. Dashboard Tests (`dashboard.spec.ts`)
- Dashboard display and navigation
- User information display
- Spaces/teams listing
- Responsive design
- Activity tracking

### 3. Spaces Management Tests (`spaces.spec.ts`)
- Space navigation and display
- File listing and management
- Upload/download functionality
- File deletion
- Metadata handling
- Role-based access

### 4. File Upload Tests (`file-upload.spec.ts`)
- Various file types and sizes
- Upload progress and status
- Error handling and validation
- Drag and drop functionality
- Upload cancellation and retry
- Metadata attachment

### 5. API Integration Tests (`api-integration.spec.ts`)
- API endpoint testing
- Authentication and authorization
- Error handling
- Rate limiting
- CORS headers
- Database integration

## Running Tests

### Prerequisites
1. Install dependencies: `npm install`
2. Set up database: `npm run db:setup`
3. Seed test data: `npm run db:seed`
4. Start the application: `npm run dev`

### Test Commands

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run specific test file
npx playwright test auth.spec.ts

# Run tests for specific browser
npx playwright test --project=chromium

# Generate test report
npm run test:report
```

### Test Configuration

The tests are configured in `playwright.config.ts` with:
- Multiple browser support (Chrome, Firefox, Safari)
- Mobile device testing
- Automatic test server startup
- Screenshot and video recording on failure
- Trace collection for debugging
- Global setup and teardown

## Test Data

Test data is managed in `utils/test-data.ts` and includes:
- Test users with different roles
- Test teams/spaces
- Sample files of various types and sizes
- OTA image test files

## Test Utilities

### AuthHelper (`utils/auth-helpers.ts`)
- Login/logout functionality
- Session state checking
- Role-based authentication

### FileHelper (`utils/file-helpers.ts`)
- File upload/download operations
- File management (create, delete, verify)
- File metadata handling

## Global Setup/Teardown

### Setup (`global-setup.ts`)
- Cleans and seeds test database
- Creates test users and teams
- Verifies application health
- Sets up test environment

### Teardown (`global-teardown.ts`)
- Cleans up test data
- Resets database state
- Ensures clean test environment

## Best Practices

1. **Test Isolation**: Each test is independent and can run in parallel
2. **Data Cleanup**: Global teardown ensures clean state between test runs
3. **Error Handling**: Comprehensive error checking and validation
4. **Accessibility**: Tests include mobile and responsive design checks
5. **API Testing**: Both frontend and backend integration testing
6. **Real Browser Testing**: Uses actual browsers for realistic testing

## Debugging

### Failed Tests
- Screenshots are automatically captured on failure
- Videos are recorded for failed tests
- Traces are collected for debugging
- Use `npm run test:debug` for step-by-step debugging

### Test Reports
- HTML reports are generated in `playwright-report/`
- JSON reports in `test-results/results.json`
- JUnit reports in `test-results/results.xml`

### Common Issues
1. **Database Connection**: Ensure database is running and accessible
2. **Application Startup**: Verify the app starts on port 3000
3. **Test Data**: Check that global setup completed successfully
4. **File Permissions**: Ensure test files can be created and accessed

## Continuous Integration

The test suite is designed to run in CI environments with:
- Headless browser execution
- Parallel test execution
- Automatic retry on failure
- Comprehensive reporting
- Database setup and cleanup

## Adding New Tests

1. Create new test file in `tests/` directory
2. Follow naming convention: `*.spec.ts`
3. Use existing utilities and helpers
4. Include proper setup and cleanup
5. Add to appropriate test category
6. Update this README if needed
