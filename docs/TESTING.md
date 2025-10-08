# Testing Guide

This document provides comprehensive information about testing the Sunlighten - Partner Storage.

## Overview

The application uses a multi-layered testing approach:

1. **Unit Tests** - Individual component testing
2. **Integration Tests** - API and database integration
3. **End-to-End (E2E) Tests** - Full user workflow testing with Playwright

## E2E Testing with Playwright

### Test Structure

```
tests/
├── README.md                 # Test documentation
├── global-setup.ts          # Global test setup
├── global-teardown.ts       # Global test cleanup
├── auth.spec.ts             # Authentication tests
├── dashboard.spec.ts        # Dashboard functionality tests
├── spaces.spec.ts           # Spaces management tests
├── file-upload.spec.ts      # File upload tests
├── api-integration.spec.ts  # API integration tests
└── utils/                   # Test utilities
    ├── test-data.ts         # Test data definitions
    ├── auth-helpers.ts      # Authentication helpers
    └── file-helpers.ts      # File operation helpers
```

### Test Categories

#### 1. Authentication Tests
- **Login/Logout**: Valid and invalid credentials
- **Session Management**: Session persistence and expiration
- **Route Protection**: Access control for protected routes
- **User Roles**: Different access levels for owners and members

#### 2. Dashboard Tests
- **Navigation**: Menu and page navigation
- **Data Display**: User information and spaces listing
- **Responsive Design**: Mobile and desktop layouts
- **Activity Tracking**: Recent activity display

#### 3. Spaces Management Tests
- **Space Navigation**: Accessing different spaces
- **File Management**: Upload, download, and delete operations
- **Metadata Handling**: File descriptions, versions, changelogs
- **Access Control**: Role-based space access

#### 4. File Upload Tests
- **File Types**: Various file formats and sizes
- **Upload Progress**: Progress indicators and status updates
- **Error Handling**: Validation and error recovery
- **Drag & Drop**: Alternative upload methods

#### 5. API Integration Tests
- **Endpoint Testing**: All API endpoints
- **Authentication**: API security and authorization
- **Error Handling**: Proper error responses
- **Rate Limiting**: Performance and security testing

## Running Tests

### Prerequisites

1. **Node.js 20+** installed
2. **PostgreSQL** running and accessible
3. **Environment variables** configured
4. **Dependencies** installed (`npm install`)

### Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Setup database
npm run db:setup
npm run db:seed

# Run all tests
npm test
```

### Test Commands

```bash
# Run all tests (headless)
npm test

# Run tests with UI
npm run test:ui

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run specific test file
npx playwright test auth.spec.ts

# Run tests for specific browser
npx playwright test --project=chromium

# Run tests with custom options
npx playwright test --headed --project=firefox --grep="login"
```

### Using the Test Runner Script

```bash
# Make script executable
chmod +x scripts/test-runner.sh

# Run all tests
./scripts/test-runner.sh

# Run with UI
./scripts/test-runner.sh --ui

# Run specific test file
./scripts/test-runner.sh --file auth.spec.ts

# Run for specific browser
./scripts/test-runner.sh --browser chromium

# Get help
./scripts/test-runner.sh --help
```

## Test Configuration

### Playwright Configuration (`playwright.config.ts`)

- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Parallel Execution**: Tests run in parallel for speed
- **Retry Logic**: Failed tests retry on CI
- **Screenshots**: Captured on failure
- **Videos**: Recorded for failed tests
- **Traces**: Collected for debugging

### Global Setup (`tests/global-setup.ts`)

- **Database Cleanup**: Removes existing test data
- **Test Data Creation**: Creates users, teams, and files
- **Application Health Check**: Verifies app is running
- **Environment Setup**: Configures test environment

### Global Teardown (`tests/global-teardown.ts`)

- **Database Cleanup**: Removes all test data
- **Resource Cleanup**: Cleans up test resources
- **State Reset**: Ensures clean state for next run

## Test Data Management

### Test Users

```typescript
// Owner user
{
  email: 'test@test.com',
  password: 'admin123',
  role: 'owner',
  name: 'Test User'
}

// Member user
{
  email: 'member@test.com',
  password: 'member123',
  role: 'member',
  name: 'Test Member'
}
```

### Test Teams/Spaces

```typescript
// Blaupunkt space
{
  name: 'Blaupunkt',
  slug: 'blaupunkt',
  description: 'Blaupunkt Android tablet OTA images',
  s3Prefix: 'uploads/blaupunkt'
}

// Test team
{
  name: 'Test Team',
  slug: 'test-team',
  description: 'Test team for E2E testing',
  s3Prefix: 'uploads/test-team'
}
```

### Test Files

```typescript
// Small text file
{
  name: 'test-small.txt',
  content: 'This is a small test file',
  size: 50,
  type: 'text/plain'
}

// OTA image file
{
  name: 'test-ota-image.zip',
  content: 'PK\x03\x04...', // ZIP file header
  size: 22,
  type: 'application/zip'
}
```

## Debugging Tests

### Failed Test Investigation

1. **Screenshots**: Check `test-results/` directory
2. **Videos**: Watch recorded test execution
3. **Traces**: Use `npx playwright show-trace trace.zip`
4. **Logs**: Check console output and network logs

### Debug Mode

```bash
# Run in debug mode
npm run test:debug

# Run specific test in debug mode
npx playwright test auth.spec.ts --debug
```

### Common Issues

#### Database Connection Issues
```bash
# Check database status
pg_isready -h localhost -p 5432

# Reset database
npm run db:setup
npm run db:seed
```

#### Application Not Starting
```bash
# Check if port 3000 is available
lsof -i :3000

# Kill existing processes
pkill -f "next dev"
```

#### Test Data Issues
```bash
# Clean and reseed database
npm run db:setup
npm run db:seed
```

## Continuous Integration

### GitHub Actions

The CI pipeline runs tests on:
- **Push to main/develop branches**
- **Pull requests**
- **Manual triggers**

### CI Configuration

- **PostgreSQL Service**: Database for testing
- **Node.js 20**: Latest LTS version
- **Multiple Browsers**: Chrome, Firefox, Safari
- **Parallel Execution**: Faster test execution
- **Artifact Upload**: Test reports and videos

### Local CI Simulation

```bash
# Simulate CI environment
NODE_ENV=test npm test

# Run with CI settings
npx playwright test --reporter=github
```

## Best Practices

### Writing Tests

1. **Test Isolation**: Each test is independent
2. **Descriptive Names**: Clear test descriptions
3. **Single Responsibility**: One test per scenario
4. **Proper Cleanup**: Clean up after tests
5. **Error Handling**: Test both success and failure cases

### Test Organization

1. **Group Related Tests**: Use `describe` blocks
2. **Setup and Teardown**: Use `beforeEach` and `afterEach`
3. **Helper Functions**: Reuse common operations
4. **Data Management**: Use consistent test data
5. **Page Objects**: Consider for complex pages

### Performance

1. **Parallel Execution**: Run tests in parallel
2. **Selective Testing**: Run only changed tests
3. **Resource Management**: Clean up resources
4. **Timeout Handling**: Set appropriate timeouts
5. **Network Optimization**: Mock external services

## Monitoring and Reporting

### Test Reports

- **HTML Report**: `playwright-report/index.html`
- **JSON Report**: `test-results/results.json`
- **JUnit Report**: `test-results/results.xml`

### Metrics

- **Test Coverage**: Track test coverage
- **Execution Time**: Monitor test performance
- **Failure Rate**: Track test reliability
- **Flaky Tests**: Identify unstable tests

### Alerts

- **Test Failures**: Immediate notification
- **Performance Degradation**: Track execution time
- **Coverage Drops**: Monitor test coverage
- **Flaky Tests**: Identify unstable tests

## Troubleshooting

### Common Problems

1. **Tests Timing Out**: Increase timeout values
2. **Element Not Found**: Add proper waits
3. **Database Issues**: Check connection and data
4. **Browser Issues**: Update browser versions
5. **Network Issues**: Check connectivity

### Debug Tools

1. **Playwright Inspector**: `npx playwright codegen`
2. **Browser DevTools**: Use browser debugging
3. **Network Tab**: Monitor API calls
4. **Console Logs**: Check JavaScript errors
5. **Trace Viewer**: Analyze test execution

### Getting Help

1. **Documentation**: Check Playwright docs
2. **Community**: GitHub discussions
3. **Issues**: Report bugs and feature requests
4. **Stack Overflow**: Search for solutions
5. **Team Chat**: Ask team members

## Future Improvements

### Planned Enhancements

1. **Visual Regression Testing**: Screenshot comparisons
2. **Performance Testing**: Load and stress testing
3. **Accessibility Testing**: A11y compliance
4. **Cross-browser Testing**: More browser coverage
5. **Mobile Testing**: Device-specific testing

### Test Automation

1. **Scheduled Runs**: Daily test execution
2. **Smoke Tests**: Quick validation tests
3. **Regression Tests**: Full test suite
4. **Performance Tests**: Load testing
5. **Security Tests**: Security validation

This testing guide provides a comprehensive foundation for maintaining high-quality E2E tests for the Sunlighten - Partner Storage.
