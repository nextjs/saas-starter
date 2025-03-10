# Testing Best Practices Guide

allways check /home/node/gasless/ai-saas-starter/common-typescript-errors.md
also always check /home/node/gasless/ai-saas-starter/types.d.ts

## Table of Contents

1.  [Test File Setup](#test-file-setup)
2.  [Type System Integration](#type-system-integration)
3.  [Mocking Best Practices](#mocking-best-practices)
    *   [Supabase Client Mocking](#supabase-client-mocking)
    *   [Next.js Router Mocking](#nextjs-router-mocking)
    *   [next/header Mocking](#nextjs-header-mocking)
4.  [Component Testing Patterns](#component-testing-patterns)
5.  [Testing Server Actions](#testing-server-actions)
6.  [Testing Custom Hooks](#testing-custom-hooks)
7.  [Common Pitfalls](#common-pitfalls)
8.  [Testing Utilities](#testing-utilities)

## Test File Setup

### Required Imports

```typescript
// Always include these imports in this order
import '@testing-library/jest-dom';  // Must be first for type augmentation
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // PREFER userEvent over fireEvent
import { ComponentToTest } from '@/components/path-to-component';
// Additional imports specific to the test
```

### File Structure

-   Place tests in `__tests__` directory mirroring the source structure
-   Name test files with `.test.tsx` extension
-   Group related tests using `describe` blocks
-   Use clear, descriptive test names

```typescript
describe('ComponentName', () => {
  describe('Specific Feature/Mode', () => {
    it('should describe expected behavior', async () => { // Use async/await
      // test implementation
    });
  });
});
```

## Type System Integration

### Type Declarations

-   Import types from their respective `.d.ts` files *or* from the file where they are defined.
-   Use type assertions sparingly and only when necessary.
-   Extend existing types when needed.

```typescript
// Good
import type { AuthResponse } from '@/types/auth.d';
// Or directly from the source, if exported:
// import type { AuthResponse } from '@/lib/auth';

// Bad
const mockData = data as any;
```

### Mock Type Safety

-   Always type your mocks.
-   Use proper return types for mock functions.
-   Leverage TypeScript's inference when possible.
-   Use `jest.Mocked<T>` to get type safety for mocked modules.

```typescript
// Good
const mockAuth = {
  signInWithPassword: jest.fn<Promise<AuthResponse>, [any]>(), // Explicit return and arguments
  signUp: jest.fn<Promise<AuthResponse>, [any]>()
};
// Even better, if you can import the type of the actual function:
import type { signInWithPassword } from '@supabase/supabase-js';
const mockSignIn: jest.MockedFunction<typeof signInWithPassword> = jest.fn();


// Bad
const mockAuth = {
  signInWithPassword: jest.fn(), // No type information
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

### Supabase Client Mocking

Since you're using `@supabase/ssr` with `createClient` functions, mock those functions. *Do not* mock `@supabase/supabase-js` directly.

```typescript
// __tests__/setup/test-utils.tsx (or a similar setup file)
import { createClient } from '@/utils/supabase/client';

jest.mock('@/utils/supabase/client'); // Mock the client creation

const mockSupabase = {
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    updateUser: jest.fn(),
    signOut: jest.fn(),
    admin: {
      deleteUser: jest.fn(),
    },
    getUser: jest.fn(),
  },
};

// Type-safe mocking of the client creation function:
(createClient as jest.Mock).mockReturnValue(mockSupabase);

export { mockSupabase }; // Export for use in tests
```

Then, in your test files:

```typescript
import { mockSupabase } from '@/__tests__/setup/test-utils';

// ...inside a test...
mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
  data: { user: { id: '123' } },
  error: null
});
```
### next/headers Mocking
Because you are using server function, we need to mock  `cookies` to allow test to work properly
```typescript
// __tests__/setup/test-utils.tsx
jest.mock('next/headers', () => ({
  cookies: () => {
    const cookies = new Map();
    return {
      get: (name: string) => {
        return cookies.get(name)
      },
      set: (name: string, value: string) => {
        cookies.set(name,value)
      },
      delete: (name: string) => {
        cookies.delete(name)
      },
       getAll: ()=> {
        return Array.from(cookies.entries()).map(([name, value]) => ({ name, value }))
      },
      has:(name:string)=>{
        return cookies.has(name);
      }

    }
  }
}));
```

### Next.js Router Mocking

```typescript
// __tests__/setup/test-utils.tsx (or within individual test files if only needed locally)

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(), // Add other router methods as needed
  })),
  redirect: jest.fn(),  // Add this
}));

// Example usage in a test
import { useRouter, useSearchParams, redirect } from 'next/navigation';

// ... inside a test ...
(useRouter as jest.MockedFunction<typeof useRouter>).mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
  });
(useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockReturnValue(new URLSearchParams('?foo=bar'));
(redirect as jest.MockedFunction<typeof redirect>).mockImplementation(()=> { throw new Error('REDIRECT')})
// You can also assert on the mocked functions:
// expect(useRouter().push).toHaveBeenCalledWith('/some-path');
```

### Mock Reset

```typescript
beforeEach(() => {
  jest.clearAllMocks(); // Clears all mock calls and implementations
});

afterEach(() => {
  // Clean up any side effects (e.g., timers, event listeners)
});
```

## Component Testing Patterns

### Rendering

```typescript
// Prefer standalone render for simple cases
render(<Component {...props} />);

// Use custom render when needed (e.g., for providers, or ThemeProvider)
import { render } from '@/__tests__/utils/test-utils'; // your custom render
render(<Component {...props} />);
```

### Queries (in order of preference)

1.  `getByRole` (most accessible)
2.  `getByLabelText` (form inputs)
3.  `getByText` (visible text)
4.  `getByTestId` (last resort)

```typescript
// Good
expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

// Avoid
expect(screen.getByTestId('submit-button')).toBeInTheDocument();
```

### Event Handling
```typescript
import userEvent from '@testing-library/user-event'
it('should handle button clicks', async() => {
  render(<MyComponent/>)
  const button = screen.getByRole('button', { name: /click me/i })

  await userEvent.click(button)
  expect(handleClick).toHaveBeenCalledTimes(1) //example
})
```

### Async Testing

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

## Testing Server Actions

When testing components that use server actions, you'll often be using `useActionState`.  Here's how to approach it:

```typescript
import { useActionState } from '@/lib/hooks/useActionState';

jest.mock('@/lib/hooks/useActionState'); // Mock the hook

it('should handle form submission with useActionState', async () => {
  const mockAction = jest.fn();
  (useActionState as jest.Mock).mockReturnValue([
    { data: null, error: null }, // Initial state
    mockAction,                 // Mocked action dispatcher
    false                       // isPending
  ]);

  render(<MyForm />);

  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));

  expect(mockAction).toHaveBeenCalled();

  // Simulate the action resolving:
  const updatedState = { data: { success: true }, error: null };
    (useActionState as jest.Mock).mockReturnValueOnce([
        updatedState,
        mockAction,
        false
    ]);
    rerender(<MyForm />); // Re-render to pick up updated state
  await waitFor(() => expect(screen.getByText(/Success!/)).toBeInTheDocument());
});
```

Key points:

*   **Mock `useActionState`:**  This lets you control the state and the action function.
*   **Mock Return Values:** Use `.mockReturnValue` (or `.mockReturnValueOnce` for multiple calls) to simulate the state changes that `useActionState` would go through (initial state, pending state, resolved state).
*   **`rerender`:**  If your component's UI updates based on the state returned by `useActionState`, you might need to `rerender` the component after mocking a state change to trigger the re-render.
* **useTransition**: For testing loading states you have to wrap your action into `startTransition` like in the code

## Testing Custom Hooks

Custom hooks should be tested in isolation, similar to how you test utility functions.  Use `@testing-library/react` (or `@testing-library/react-hooks` if you have an older version) to render the hook:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '@/lib/hooks/useCounter'; // Example custom hook

describe('useCounter', () => {
  it('should increment and decrement correctly', () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0); // Initial state

    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(1);

    act(() => {
      result.current.decrement();
    });
    expect(result.current.count).toBe(0);
  });
});
```

Key points:

*   **`renderHook`:**  This function renders your hook in a testing environment.
*   **`act`:**  Wrap state updates within `act` to ensure they are processed correctly by React.  This is essential for testing hooks.
* **Focus on Logic:** Test the hook's internal logic, state changes, and return values, not its UI rendering (since hooks don't render UI directly).

## Common Pitfalls

### Type System Issues

1.  Missing `@testing-library/jest-dom` imports
2.  Incorrect mock return types
3.  Missing type declarations in `.d.ts` files

### Solution:

```typescript
// In your test file
import '@testing-library/jest-dom';

// In types.d.ts
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      // ... other custom matchers
    }
  }
}
```

### Event Handling

1.  Not using `await` with `fireEvent` or `userEvent`
2.  Missing user interactions
3.  Race conditions in async tests

### Solution:

```typescript
// Good
await userEvent.click(button); // Use userEvent instead of fireEvent
await waitFor(() => {
  expect(mockFunction).toHaveBeenCalled();
});

// Bad
fireEvent.click(button);
expect(mockFunction).toHaveBeenCalled();
```

### Test Path Issues

1. Special characters in test paths (e.g., parentheses)
2. Incorrect path resolution
3. Platform-specific path separators

### Solution:

```bash
# Bad - Will fail with special characters
pnpm jest __tests__/lib/app/(login)/actions/sign-up.test.ts

# Good - Escape special characters and use quotes
pnpm jest "./__tests__/lib/app/\\(login\\)/actions/sign-up.test.ts"

# Alternative - Use glob patterns
pnpm jest "**/(login)/**/*.test.ts"

# For Windows compatibility, use forward slashes
pnpm jest "./__tests__/lib/app/(login)/actions/sign-up.test.ts"  # NOT backslashes
```

Key points:
- Always wrap paths in quotes to handle spaces and special characters
- Escape parentheses with double backslashes: `\\(` and `\\)`
- Use relative paths starting with `./` for clarity
- Use forward slashes even on Windows
- When running from npm scripts, escape characters properly in package.json:
  ```json
  {
    "scripts": {
      "test:login": "jest \"./__tests__/lib/app/\\(login\\)/actions/sign-up.test.ts\""
    }
  }
  ```

## Testing Utilities

### Custom Matchers

```typescript
// In __tests__/setup/test-utils.tsx

// Add it to be extendable
export {};

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeValidEmail(): R;
        }
    }
}

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
// In __tests__/factories/userFactory.ts

import type { User } from '@/lib/db/schema';

//Type the override
export function createUser(overrides?: Partial<User>): User {
  return {
    id: 1, // Use a number, since that's your User type
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashed_password',
    role: 'member',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    firstName: null,
    lastName: null,
    avatarUrl: null,
    phoneNumber: null,
    telegramUsername: null,
    organizationId: null,
    roleId: null,
      teamId: null,
    ...overrides, // Allow overriding any field
  };
}

// Usage in tests:
import { createUser } from '@/__tests__/factories/userFactory';

const mockUser = createUser({ email: 'custom@example.com' });
```

### Common Test Scenarios

#### Form Testing

```typescript
it('handles form submission', async () => {
  render(<Form />);

  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));

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

  await userEvent.click(screen.getByRole('button'));

  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent(/failed/i);
  });
});
```

#### Loading States

```typescript
it('shows loading state', async () => {
    mockFunction.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );
    render(<Component />);

    const button = screen.getByRole('button');
    await userEvent.click(button);

    // Check for loading state
    expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled()

    // Wait for loading state to disappear
    await waitFor(() => {
        expect(screen.getByRole('button', { name: /loading/i })).toBeEnabled()
    });
    // Additional assertions after loading
});
```

## Project-Specific Considerations

### Authentication Testing

-   Mock Supabase auth responses using `mockSupabase.auth`.
-   Test both success and error paths.
-   Verify redirect behavior using mocked `next/navigation`.
-   Test loading states.

### Form Validation

-   Test all validation rules defined by your Zod schemas.
-   Verify error messages are displayed correctly.
-   Test field interactions (e.g., dependencies between fields).
-   Check submission behavior (success, failure, loading).

### Component State

-   Test initial render with various props.
-   Test state transitions triggered by user interactions.
-   Verify side effects (e.g., API calls) are triggered correctly.
-   Check cleanup (e.g., unsubscribing from event listeners).

## Continuous Integration (CI)

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
*Example using `husky`, but you can use the tool of your choice.*

### Coverage Requirements

-   Maintain minimum coverage thresholds.
-   Focus on critical paths.
-   Document exclusions.

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
  },
  // You can also exclude specific files/folders:
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/__tests__/",
    "/lib/db/migrations/", // Exclude migrations
  ],
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

# Debugging with breakpoints (requires Node.js debugger)
node --inspect-brk ./node_modules/.bin/jest -i --no-cache --runInBand path/to/test.test.tsx
```
### Debug Output
```typescript
import { prettyDOM } from '@testing-library/dom'

// ...
// In a test case:

  const { container, debug } = render(<MyComponent />);

  // Print the entire rendered DOM:
  // eslint-disable-next-line testing-library/no-debugging-utils
  debug()
    // Print a specific element:
    // eslint-disable-next-line testing-library/no-debugging-utils
  debug(screen.getByRole('button'));
  console.log(prettyDOM(screen.getByRole('button')));
```
The eslint comment, is needed to avoid linting error, but it's a recommanded practice to use.

## Documentation

### Test Documentation

-   Document test setup requirements.
-   Explain complex test scenarios.
-   Document mock requirements.
-   Include examples for new patterns.

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
  await userEvent.click(screen.getByRole('button', { name: /save/i }));

  // THEN
  await waitFor(() => {
    expect(mockUpdateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockUser.id })
    );
  });
});
```

This revised document includes more specific guidance, addresses common pitfalls, and aligns with your project's technology stack. It also emphasizes type safety and best practices for mocking and testing server actions. It is also MVP focused.  It is a very good base for your project.
