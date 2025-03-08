# Common TypeScript Errors and Solutions

This document provides solutions for common TypeScript errors you might encounter in this project.

## Tailwind CSS Configuration Errors

### Error: darkMode Array Format in Tailwind v4

**Error Message:**
```
Type '["class"]' is not assignable to type 'DarkModeStrategy | undefined'.
Type '["class"]' is not assignable to type '["class", string]'.
Source has 1 element(s) but target requires 2.
```

**Solution:**
In Tailwind CSS v4, the `darkMode` property has changed its type definition. When using an array format, it expects exactly two elements: `["class", "selector"]`. For most use cases, you can simply use the string `"class"` instead of the array `["class"]`.

Change:
```typescript
darkMode: ["class"]
```

To:
```typescript
darkMode: "class"
```

**Explanation:**
Tailwind CSS v4 changed how the darkMode configuration works. The array format is now used for more advanced configurations where you need to specify both the strategy and a custom selector. For the common use case of using the "class" strategy with the default selector, you can use the simpler string format.

## Type Definition Errors

### Error: Missing Type Definitions for External Libraries

**Error Message:**
```
Could not find a declaration file for module 'some-library'.
```

**Solution:**
Install type definitions for the library:

```bash
pnpm add -D @types/some-library
```

If official type definitions don't exist, create a declaration file:

```typescript
// src/types/some-library.d.ts
declare module 'some-library' {
  // Define types based on the library's API
  export function someFunction(): void;
  // ...
}
```

## React Component Errors

### Error: Props Type Mismatch

**Error Message:**
```
Type '{ prop: string; }' is not assignable to type 'ComponentProps'.
  Property 'requiredProp' is missing in type '{ prop: string; }' but required in type 'ComponentProps'.
```

**Solution:**
Ensure all required props are provided to components:

```tsx
// Incorrect
<Component prop="value" />

// Correct
<Component prop="value" requiredProp={true} />
```

Or make the prop optional in the component's props interface:

```tsx
interface ComponentProps {
  prop?: string;
  requiredProp: boolean;
}
```

## Import/Export Errors

### Error: Cannot Find Module

**Error Message:**
```
Cannot find module '@/components/ui/button' or its corresponding type declarations.
```

**Solution:**
1. Check that the file exists at the specified path
2. Verify your tsconfig.json has the correct path aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

3. If using Next.js, ensure the import path matches your project structure

## Type Assertion Errors

### Error: Type 'unknown' is not assignable to type 'ExpectedType'

**Error Message:**
```
Type 'unknown' is not assignable to type 'ExpectedType'.
```

**Solution:**
Use type guards or type assertions with caution:

```typescript
// Using type guard (preferred)
function isExpectedType(value: unknown): value is ExpectedType {
  return typeof value === 'object' && value !== null && 'requiredProperty' in value;
}

if (isExpectedType(data)) {
  // data is now typed as ExpectedType
  console.log(data.requiredProperty);
}

// Using type assertion (use with caution)
const data = response.data as ExpectedType;
```

## Generic Type Errors

### Error: Type 'T' does not satisfy the constraint 'SomeType'

**Error Message:**
```
Type 'T' does not satisfy the constraint 'SomeType'.
```

**Solution:**
Add constraints to your generic types:

```typescript
// Incorrect
function processData<T>(data: T) {
  return data.property; // Error: property does not exist on type 'T'
}

// Correct
function processData<T extends { property: string }>(data: T) {
  return data.property; // Works fine
}
```

## Next.js Specific Errors

### Error: 'Component' cannot be used as a JSX component

**Error Message:**
```
'Component' cannot be used as a JSX component.
  Its return type 'Promise<Element>' is not a valid JSX element.
```

**Solution:**
For Next.js server components, make sure to:

1. Use the correct component type:
```typescript
// For client components
'use client';
import { FC } from 'react';

interface Props {
  // ...
}

const ClientComponent: FC<Props> = ({ ... }) => {
  // ...
};

// For server components
import { ReactNode } from 'react';

interface Props {
  // ...
}

async function ServerComponent({ ... }: Props): Promise<ReactNode> {
  // ...
}
```

2. Use the correct file extension (`.tsx` for components with JSX)

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Next.js TypeScript Documentation](https://nextjs.org/docs/basic-features/typescript)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) 