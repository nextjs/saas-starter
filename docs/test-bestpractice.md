# Testing Best Practices Guide

## Table of Contents
1. [Test File Setup](#test-file-setup)
2. [Type System Integration](#type-system-integration)
3. [Mocking Best Practices](#mocking-best-practices)
4. [Component Testing Patterns](#component-testing-patterns)
5. [Common Pitfalls](#common-pitfalls)
6. [Testing Utilities](#testing-utilities)

## Test File Setup

### Required Imports
```typescript
// Always include these imports in this order
import '@testing-library/jest-dom';  // Must be first for type augmentation
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ComponentToTest } from '@/components/path-to-component';
// Additional imports specific to the test
```

### File Structure
- Place tests in `__tests__` directory mirroring the source structure
- Name test files with `.test.tsx` extension
- Group related tests using describe blocks
- Use clear, descriptive test names

```typescript
describe('ComponentName', () => {
  describe('Specific Feature/Mode', () => {
    it('should describe expected behavior', () => {
      // test implementation
    });
  });
});
```

## Type System Integration

### Type Declarations
- Import types from their respective `.d.ts` files
- Use type assertions sparingly and only when necessary
- Extend existing types when needed

```typescript
// Good
import type { AuthResponse } from '@/types/auth.d';

// Bad
const mockData = data as any;
```

### Mock Type Safety
- Always type your mocks
- Use proper return types for mock functions
- Leverage TypeScript's inference when possible

```typescript
// Good
const mockAuth = {
  signInWithPassword: jest.fn<Promise<AuthResponse>, [any]>(),
  signUp: jest.fn<Promise<AuthResponse>, [any]>()
};

// Bad
const mockAuth = {
  signInWithPassword: jest.fn(),
  signUp: jest.fn()
};
```

## Mocking Best Practices

### Module Mocking
```typescript
// Mock entire modules
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn()
  })
}));

// Mock specific functions
jest.spyOn(someModule, 'functionName');
```

### Mock Reset
- Always clear mocks in beforeEach
- Reset specific mocks when needed
- Consider using afterEach for cleanup

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up any side effects
});
```

## Component Testing Patterns

### Rendering
```typescript
// Prefer standalone render
render(<Component {...props} />);

// Use custom render when needed (e.g., for providers)
const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, {
    wrapper: ({ children }) => (
      <Providers>{children}</Providers>
    ),
    ...options,
  });
```

### Queries (in order of preference)
1. getByRole (most accessible)
2. getByLabelText (form inputs)
3. getByText (visible text)
4. getByTestId (last resort)

```typescript
// Good
expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

// Avoid
expect(screen.getByTestId('submit-button')).toBeInTheDocument();
```

### Async Testing
- Always use waitFor for async operations
- Prefer async/await over .then()
- Handle loading states

```typescript
// Good
await waitFor(() => {
  expect(screen.getByRole('alert')).toHaveTextContent(/success/i);
});

// Bad
setTimeout(() => {
  expect(screen.getByRole('alert')).toBeInTheDocument();
}, 1000);
```

## Common Pitfalls

### Type System Issues
1. Missing @testing-library/jest-dom imports
2. Incorrect mock return types
3. Missing type declarations in .d.ts files

### Solution:
```typescript
// In your test file
/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom';

// In types.d.ts
declare namespace jest {
  interface Matchers<R> {
    toBeInTheDocument(): R;
    toHaveTextContent(text: string | RegExp): R;
  }
}
```

### Event Handling
1. Not using await with fireEvent
2. Missing user interactions
3. Race conditions in async tests

### Solution:
```typescript
// Good
await fireEvent.click(button);
await waitFor(() => {
  expect(mockFunction).toHaveBeenCalled();
});

// Bad
fireEvent.click(button);
expect(mockFunction).toHaveBeenCalled();
```

## Testing Utilities

### Custom Matchers
```typescript
expect.extend({
  toBeValidEmail(received) {
    const pass = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(received);
    return {
      pass,
      message: () => `expected ${received} to be a valid email`
    };
  }
});
```

### Test Data Factories
```typescript
const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  ...overrides
});
```

### Common Test Scenarios

#### Form Testing
```typescript
it('handles form submission', async () => {
  render(<Form />);
  
  await fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'test@example.com' }
  });
  
  await fireEvent.click(screen.getByRole('button', { name: /submit/i }));
  
  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com' })
    );
  });
});
```

#### Error Handling
```typescript
it('displays error messages', async () => {
  mockFunction.mockRejectedValueOnce(new Error('Failed'));
  
  render(<Component />);
  
  await fireEvent.click(screen.getByRole('button'));
  
  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent(/failed/i);
  });
});
```

#### Loading States
```typescript
it('shows loading state', async () => {
  const promise = new Promise((resolve) => setTimeout(resolve, 100));
  mockFunction.mockImplementationOnce(() => promise);
  
  render(<Component />);
  
  await fireEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
```

## Project-Specific Considerations

### Authentication Testing
- Mock Supabase auth responses
- Test both success and error paths
- Verify redirect behavior
- Test loading states

### Form Validation
- Test all validation rules
- Verify error messages
- Test field interactions
- Check submission behavior

### Component State
- Test initial render
- Test state transitions
- Verify side effects
- Check cleanup

## Continuous Integration

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test",
      "pre-push": "npm run test:coverage"
    }
  }
}
```

### Coverage Requirements
- Maintain minimum coverage thresholds
- Focus on critical paths
- Document exclusions

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## Debugging Tests

### Common Commands
```bash
# Run specific test
jest path/to/test.test.tsx

# Run tests in watch mode
jest --watch

# Update snapshots
jest -u

# Show coverage report
jest --coverage
```

### Debug Output
```typescript
// In your test
console.log(screen.debug());  // Print DOM
console.log(prettyDOM(element));  // Print specific element
```

## Performance Considerations

### Test Optimization
- Group related tests
- Minimize setup/teardown
- Use beforeAll when appropriate
- Mock expensive operations

### Memory Management
- Clean up subscriptions
- Clear timeouts/intervals
- Reset global state
- Clean up DOM after tests

## Documentation

### Test Documentation
- Document test setup requirements
- Explain complex test scenarios
- Document mock requirements
- Include examples for new patterns

### Comments
```typescript
// GIVEN - Setup/preconditions
// WHEN - Actions performed
// THEN - Expected outcomes

it('should update user profile', async () => {
  // GIVEN
  const mockUser = createMockUser();
  mockUpdateProfile.mockResolvedValueOnce({ success: true });
  
  // WHEN
  render(<ProfileForm user={mockUser} />);
  await fireEvent.click(screen.getByRole('button', { name: /save/i }));
  
  // THEN
  await waitFor(() => {
    expect(mockUpdateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockUser.id })
    );
  });
});
``` 