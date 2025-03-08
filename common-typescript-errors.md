# Common TypeScript Errors and Solutions

This document logs common TypeScript errors encountered during development and their solutions.

## Component Library Errors

### Error: Property does not exist on type

```
Property 'orange' does not exist on type 'ButtonVariantProps'.
```

**Problem**: When adding a new variant to a component using class-variance-authority (cva), TypeScript doesn't recognize the new variant.

**Solution**: Update the variant type definition to include the new variant.

```typescript
// Before
type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

// After
type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "orange";
```

### Error: Type 'string' is not assignable to type 'Size'

```
Type 'string' is not assignable to type 'Size'.
```

**Problem**: When using a size prop with a component, TypeScript expects a specific set of values.

**Solution**: Use a type assertion or properly type the variable.

```typescript
// Before
<Avatar size={userSize} />

// After
<Avatar size={userSize as "sm" | "md" | "lg" | "xl"} />

// Or better, properly type the variable
const userSize: "sm" | "md" | "lg" | "xl" = "md";
```

## Sonner Component Errors

### Error 1: Type Assignment Error

```
Type '"default"' is not assignable to type 'ToastTypes'.
```

**Problem**: We defined a `ToastTypes` type that didn't include "default", but we were using "default" as a default value for the `type` parameter.

**Solution**: Add "default" to the `ToastTypes` union type.

```typescript
// Before
export type ToastTypes = "success" | "error" | "info" | "warning" | "orange";

// After
export type ToastTypes = "success" | "error" | "info" | "warning" | "orange" | "default";
```

### Error 2: Type Comparison Error

```
This comparison appears to be unintentional because the types 'ToastTypes' and '"default"' have no overlap.
```

**Problem**: We were comparing `type !== "default"` but the `ToastTypes` type didn't include "default", so TypeScript flagged this as a potentially unintentional comparison.

**Solution**: 
1. Add "default" to the `ToastTypes` union type (as above)
2. Use a type assertion when accessing the icons object to ensure type safety:

```typescript
// Before
icon: icon || (type !== "default" ? icons[type] : undefined),

// After
icon: icon || (type !== "default" ? icons[type as Exclude<ToastTypes, "default">] : undefined),
```

### Error 3: Unknown Property Error

```
Object literal may only specify known properties, and 'orange' does not exist in type 'ToastClassnames'.
```

**Problem**: We were adding an 'orange' property to the classNames object, but the `ToastClassnames` type from the Sonner library doesn't include this property.

**Solution**: Create an extended interface that includes our custom property and use a type assertion:

```typescript
// Define an extended interface
interface ExtendedToastClassnames extends ToastClassnames {
  orange?: string
}

// Use type assertion when passing the object
classNames: {
  // ...other properties
  orange: "group-[.toast]:border-orange-500/30 group-[.sonner-toast-orange]:bg-orange-500/10",
} as ExtendedToastClassnames
```

## Module Resolution Errors

### Error: Cannot find module or its corresponding type declarations

```
Cannot find module '@/components/theme-provider' or its corresponding type declarations.
```

**Problem**: We're importing a module that doesn't exist in our project yet. This often happens when:
1. We're following a tutorial or example that assumes certain files exist
2. We've renamed or moved files without updating imports
3. We're using a new library component that requires additional setup

**Solution**: Create the missing module with the expected interface. In this case, we needed to create a theme provider component:

```typescript
// Create the file at components/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

This approach is better than just changing the import path because:
1. It maintains the intended architecture of the application
2. It follows the expected component structure
3. It provides the functionality that the importing code expects

Remember to install any required dependencies (in this case, `next-themes`).

## Testing Framework Errors

### Error: Cannot find name 'describe', 'it', or 'expect'

```
Cannot find name 'describe'. Do you need to install type definitions for a test runner?
Cannot find name 'it'.
Cannot find name 'expect'.
```

**Problem**: TypeScript doesn't recognize Jest testing functions by default.

**Solution**: Install the type definitions for Jest:

```bash
pnpm add -D @types/jest
```

This adds the necessary type definitions to your project, allowing TypeScript to recognize the Jest testing functions.

### Error: Cannot find module '@jest/globals'

```
Cannot find module '@jest/globals' or its corresponding type declarations.
```

**Problem**: When explicitly importing Jest functions in TypeScript test files, the '@jest/globals' module is required but not installed.

**Solution**: Install the '@jest/globals' package:

```bash
pnpm add -D @jest/globals
```

Then import the Jest functions explicitly in your test files:

```typescript
import { describe, it, expect } from '@jest/globals';

describe('my test', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
```

This approach is particularly useful in TypeScript projects where you want explicit imports rather than relying on global declarations.

## Best Practices for Extending Third-Party Types

1. **Create extended interfaces**: When adding properties to objects with defined types from libraries, create an interface that extends the original.

2. **Use type assertions carefully**: Type assertions (`as`) should be used sparingly and only when you're certain about the type.

3. **Update union types**: When adding new variants or options, make sure to update the corresponding union types.

4. **Import original types**: Always import the original types from the library to extend them properly.

5. **Create missing modules**: When facing module resolution errors, create the missing modules with the expected interface rather than changing import paths. 

## Testing Best Practices

1. **Use explicit imports**: In TypeScript test files, use explicit imports from '@jest/globals' rather than relying on global declarations.

2. **Configure TypeScript for testing**: Add Jest types to your TypeScript configuration or create a separate tsconfig for tests.

3. **Add type declarations**: For global test functions, add a types.d.ts file with a reference to Jest types.

4. **Match package versions**: Ensure that your Jest and @types/jest versions are compatible.

5. **Use proper assertions**: TypeScript will help ensure you're using the correct assertion methods with the right types. 