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

## Form Validation with Zod and Server Actions

### Error: Type 'FormData' is not assignable to parameter of type 'ZodType'

**Error Message:**
```
Type 'FormData' is not assignable to parameter of type 'ZodType<any, ZodTypeDef, any>'.
```

**Solution:**
When using Zod with Server Actions, ensure you're properly parsing the FormData:

```typescript
// Incorrect
const result = schema.parse(formData);

// Correct
const result = schema.safeParse(Object.fromEntries(formData));
```

**Explanation:**
FormData is a collection of key/value pairs, but Zod expects a plain object. Use `Object.fromEntries(formData)` to convert FormData to a plain object before validation.

### Error: Property 'fieldName' does not exist on type 'ZodType'

**Error Message:**
```
Property 'fieldName' does not exist on type 'z.infer<typeof schema>'.
```

**Solution:**
Ensure your Zod schema includes all fields that you're trying to access:

```typescript
// Incorrect
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Later trying to access: data.firstName

// Correct
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
});
```

### Error: Type 'unknown' is not assignable to type 'string'

**Error Message:**
```
Type 'unknown' is not assignable to type 'string'.
```

**Solution:**
When extracting values from FormData, TypeScript doesn't know the type. Use type assertions or proper validation:

```typescript
// Using type assertion (use with caution)
const email = formData.get('email') as string;

// Better: Using Zod for validation
const result = schema.safeParse(Object.fromEntries(formData));
if (result.success) {
  const { email } = result.data; // email is properly typed as string
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

## Server Actions and Form Handling

### Error: Property 'formAction' does not exist on type 'JSX.IntrinsicElements.form'

**Error Message:**
```
Property 'formAction' does not exist on type 'JSX.IntrinsicElements.form'.
```

**Solution:**
When using Server Actions with forms, ensure you're using the correct action attribute:

```tsx
// Incorrect
<form formAction={serverAction}>

// Correct
<form action={serverAction}>
```

### Error: Type '(prevState: ActionState, formData: FormData) => Promise<T>' is not assignable to type 'FormAction'

**Error Message:**
```
Type '(prevState: ActionState, formData: FormData) => Promise<T>' is not assignable to type 'FormAction'.
```

**Solution:**
Ensure your Server Action has the correct signature and is properly typed:

```typescript
// For useActionState hook
const [state, formAction, pending] = useActionState<ActionState, FormData>(
  serverAction,
  initialState
);

// The serverAction should have this signature:
async function serverAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  // ...
}
```

## Next.js and Supabase Integration Errors

### Error: Route "/" used `cookies().get()`. `cookies()` should be awaited before using its value.

**Error Message:**
```
Error: Route "/" used `cookies().get('sb-xxx-auth-token')`. `cookies()` should be awaited before using its value.
```

**Solution:**
In Next.js, the `cookies()` function returns a Promise in some versions. You need to await it before accessing its methods:

```typescript
// Incorrect
const cookieStore = cookies()
const cookie = cookieStore.get(name)

// Correct
const cookieStore = cookies()
const cookieJar = await cookieStore
const cookie = cookieJar.get(name)
```

**Explanation:**
The Next.js cookies API changed to be asynchronous in some versions. When integrating with Supabase, you need to properly await the cookies function before trying to access or modify cookies.

### Error: Content Security Policy blocks the use of 'eval' in JavaScript

**Error Message:**
```
Content Security Policy of your site blocks the use of 'eval' in JavaScript
```

**Solution:**
When using Supabase Auth, you need to modify your Content Security Policy to allow certain operations:

1. Using middleware:
```typescript
// In middleware.ts
const isDevelopment = process.env.NODE_ENV === 'development'

if (!isDevelopment) {
  // Only set CSP in production
  requestHeaders.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.supabase.co; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src 'self' https://*.supabase.co;`
  )
} else {
  // Remove any existing CSP in development
  requestHeaders.delete('Content-Security-Policy')
}
```

2. Using next.config.js:
```javascript
// In next.config.js
const nextConfig = {
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development' 
              ? '' // Empty in development
              : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.supabase.co; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src 'self' https://*.supabase.co;"
          }
        ]
      }
    ]
  }
}
```

3. Using meta tag in layout.tsx:
```tsx
// In app/layout.tsx
export const metadata: Metadata = {
  // ...other metadata
  other: {
    'content-security-policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.supabase.co; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src 'self' https://*.supabase.co;"
  }
}
```

**Explanation:**
Supabase Auth requires 'unsafe-eval' and connections to Supabase domains. In development, it's often easier to disable CSP entirely, while in production you should use a more restrictive policy that still allows the necessary operations.

### Error: Type 'string' is not assignable to type 'number'

**Error Message:**
```
Type 'string' is not assignable to type 'number'.
```

**Solution:**
When integrating Supabase Auth with a database that uses numeric IDs, you need to handle the type conversion:

```typescript
// When using Supabase Auth with numeric database IDs
// Find the user by email instead of ID
const dbUser = await db
  .select()
  .from(users)
  .where(eq(users.email, user.email))
  .limit(1);

if (dbUser.length > 0) {
  const userData = dbUser[0];
  // Now userData.id is a number that can be used with other database operations
}
```

## React Type System Conflicts

### Error: Type 'ReactElement<any, any>' is not assignable to type 'ReactNode'

**Error Message:**
```
Type 'ReactElement<any, any>' is not assignable to type 'ReactNode'.
  Property 'children' is missing in type 'ReactElement<any, any>' but required in type 'ReactPortal'.
```

**Solution:**
1. Check for React types version mismatch:
```bash
pnpm add -D @types/react@18.2.0 @types/react-dom@18.2.0
```

2. Ensure proper ReactNode type definition:
```typescript
export type ReactNode = 
  | ReactElement
  | ReactPortal
  | string
  | number
  | boolean
  | null
  | undefined
  | Iterable<ReactNode>;
```

3. Use proper component type definitions:
```typescript
export type FC<P = {}> = FunctionComponent<P>;
export type FunctionComponent<P = {}> = (props: PropsWithChildren<P>) => ReactElement | null;
```

### Error: 'Component' cannot be used as a JSX component

**Error Message:**
```
'Component' cannot be used as a JSX component.
  Its type 'ElementType<any>' is not a valid JSX element type.
```

**Solution:**
1. Update ElementType definition:
```typescript
export type ElementType = keyof JSX.IntrinsicElements | ComponentType<any>;
```

2. Add proper JSX namespace declarations:
```typescript
namespace JSX {
  interface Element extends React.ReactElement<any, any> {}
  interface ElementClass extends React.Component<any> {
    render(): React.ReactNode;
  }
  interface ElementAttributesProperty { props: {}; }
  interface ElementChildrenAttribute { children: {}; }
}
```

## Supabase Auth Integration Errors

### Error: Property 'user_metadata' does not exist on type 'User'

**Error Message:**
```
Property 'user_metadata' does not exist on type 'User'.
```

**Solution:**
Define proper AuthUser type:
```typescript
import { User as SupabaseUser } from '@supabase/supabase-js';

type AuthUser = SupabaseUser & {
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    phone_number?: string;
  };
};
```

### Error: Module '@/lib/auth' has no exported member 'useAuth'

**Error Message:**
```
Module '@/lib/auth' has no exported member 'useAuth'.
```

**Solution:**
Properly declare auth module types:
```typescript
declare module '@/lib/auth' {
  import type { User } from '@supabase/supabase-js';
  
  export interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: Error | null;
  }

  export function useAuth(): AuthContextType;
  
  export interface AuthProviderProps {
    children: React.ReactNode;
  }
  
  export const AuthProvider: React.FC<AuthProviderProps>;
}
```

### Error: Type 'string | undefined' is not assignable to type 'number'

**Error Message:**
```
Type 'string | undefined' is not assignable to type 'number'.
```

**Solution:**
When working with Supabase Auth and database IDs:
```typescript
// Use email for lookups instead of ID
const { data: dbUser } = await supabase
  .from('users')
  .select()
  .eq('email', user.email)
  .single();

// Or parse the ID if needed
const userId = parseInt(user.id, 10);
```

### Error: Type 'User | null' is not assignable to type 'AuthUser'

**Error Message:**
```
Type 'User | null' is not assignable to type 'AuthUser'.
```

**Solution:**
Use proper type assertions or guards with Supabase Auth:
```typescript
import type { User } from '@supabase/supabase-js';

function isAuthUser(user: User | null): user is AuthUser {
  return user !== null && 'user_metadata' in user;
}

// In your component
const { user } = useAuth();
if (isAuthUser(user)) {
  // user is now typed as AuthUser
  console.log(user.user_metadata.full_name);
}
```

## React Type Compatibility Issues

### Error: Type 'import("react").ReactNode' is not assignable to type 'React.ReactNode'

**Error Message:**
```
Type 'import("react").ReactNode' is not assignable to type 'React.ReactNode'.
Type 'ReactElement<any, any>' is not assignable to type 'ReactNode'.
```

**Solution:**
1. Use direct type imports from 'react':
```typescript
import type { ReactNode, ElementType } from 'react';

interface ComponentProps {
  children: ReactNode;
}
```

2. Simplify React type declarations:
```typescript
// types/react.d.ts
declare module 'react' {
  export type ReactNode = React.ReactNode;
  export type ReactElement = React.ReactElement;
  export type ElementType = React.ElementType;
  export type ComponentType = React.ComponentType;
  export type FC = React.FC;
}
```

3. Avoid namespace conflicts:
```typescript
// Instead of
import * as React from 'react';
interface Props {
  children: React.ReactNode;
}

// Use
import type { ReactNode } from 'react';
interface Props {
  children: ReactNode;
}
```

#### Error: 'icon' cannot be used as a JSX component

**Error Message:**
```
'item.icon' cannot be used as a JSX component.
Its element type 'ReactElement<any, any> | null' is not a valid JSX element.
```

**Solution:**
1. Use the correct type for icon components:
```typescript
import type { ElementType } from 'react';

interface NavItem {
  icon: ElementType;  // Use ElementType for component types
}
```

2. For Lucide icons specifically:
```typescript
import { Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface IconProps {
  icon: LucideIcon;  // Use LucideIcon type for Lucide icons
}
```

**Explanation:**
- `ElementType` is the correct type for components that can be rendered as JSX elements
- For icon libraries like Lucide, use their specific icon types
- Avoid using `React.ComponentType` or `React.FC` for icon components

## React 18 Type System Errors

### Error: Module 'react' has no exported member 'startTransition'

**Error Message:**
```
Module 'react' has no exported member 'startTransition'.
```

**Solution:**
1. Add proper type declarations in your React types file:
```typescript
// types/react.d.ts
declare module 'react' {
  // Add transition types
  export function startTransition(scope: () => void): void;
  export function useTransition(): [boolean, (callback: () => void) => void];
}
```

2. Use startTransition properly in components:
```typescript
import { startTransition } from 'react';

function MyComponent() {
  const handleAction = () => {
    startTransition(() => {
      // Your state updates here
    });
  };
}
```

### Error: Type 'undefined' is not assignable to type 'ActionState'

**Error Message:**
```
Argument of type '(prevState: ActionState, formData: FormData) => Promise<{ error: string; } | undefined>' 
is not assignable to parameter of type '(state: ActionState, payload: FormData) => Promise<ActionState>'.
```

**Solution:**
1. Import the proper ActionState type:
```typescript
import type { ActionState } from '@/lib/auth';
```

2. Ensure your action handlers always return a valid state:
```typescript
const [state, action, isPending] = useActionState<ActionState, FormData>(
  async (prevState: ActionState, formData: FormData) => {
    const result = await someAction(prevState, formData);
    return result || { error: '' }; // Provide default state
  },
  { error: '', success: '' }
);
```

3. Type your action handlers properly:
```typescript
async function handleAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Your action logic
    return { success: 'Operation successful' };
  } catch (error) {
    return { error: 'Operation failed' };
  }
}
```

**Explanation:**
- Server actions in Next.js must always return a valid state object
- Use type guards or default values to handle undefined returns
- Properly type your action handlers to ensure type safety
- Use centralized type definitions for consistent typing

### Best Practices for Action State Types

1. **Centralize Action State Types**:
```typescript
// lib/auth/types.ts
export interface ActionState {
  error?: string;
  success?: string;
  [key: string]: any;
}
```

2. **Use Type Guards**:
```typescript
function isValidActionState(state: any): state is ActionState {
  return typeof state === 'object' && 
    ('error' in state || 'success' in state);
}
```

3. **Handle Undefined Returns**:
```typescript
async function safeAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const result = await unsafeAction(prevState, formData);
  return isValidActionState(result) ? result : { error: '' };
}
```

4. **Type Server Actions**:
```typescript
'use server';

import { ActionState } from '@/lib/auth';

export async function serverAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Your action logic
}
```

## React Component Type Patterns

### Error: Module '"react"' has no exported member 'X'

**Error Message:**
```typescript
'"react"' has no exported member 'ButtonHTMLAttributes'
Module '"react"' has no exported member 'ForwardRefRenderFunction'
Property 'forwardRef' does not exist on type 'typeof import("react")'
```

**Solution:**
1. Use proper React type imports:
```typescript
// ❌ Don't use these imports
import * as React from 'react'
import type { ButtonHTMLAttributes } from 'react'

// ✅ Use module augmentation in types/components.d.ts
declare module 'react' {
  export interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    [key: string]: any;
  }
  
  export interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: 'submit' | 'reset' | 'button';
    disabled?: boolean;
  }
}

// ✅ Then in your component, use minimal imports
import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
```

### Error: Implicit 'any' Type in Component Props

**Error Message:**
```typescript
Binding element 'className' implicitly has an 'any' type
Parameter 'ref' implicitly has an 'any' type
```

**Solution:**
1. Define component props in `types/components.d.ts`:
```typescript
declare module '@/components/ui/button' {
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, BaseComponentProps {
    variant?: 'default' | 'destructive' | 'outline';
    size?: 'default' | 'sm' | 'lg';
  }
}
```

2. Use proper type annotations in components:
```typescript
// ❌ Don't destructure props without types
const Button = forwardRef(({ className, variant }, ref) => {

// ✅ Use proper type annotations
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant }: ButtonProps,
  ref
) {
```

### Error: Type 'string' is not assignable to type 'Variant'

**Error Message:**
```typescript
Type 'string' is not assignable to type '"default" | "primary" | null | undefined'
```

**Solution:**
1. Use const assertions for default values:
```typescript
// ❌ Don't use plain strings
variant = "default"

// ✅ Use const assertions
variant = "default" as const
```

2. Define variant types using discriminated unions:
```typescript
type Variant = 'default' | 'primary' | 'secondary';
interface Props {
  variant: Variant;
}
```

### Error: Property 'X' does not exist on type 'Y'

**Error Message:**
```typescript
Property 'isLoading' does not exist on type 'ButtonHTMLAttributes<HTMLButtonElement>'
```

**Solution:**
1. Extend component props properly:
```typescript
// ❌ Don't mix HTML attributes and custom props directly
interface Props extends HTMLButtonElement {
  isLoading?: boolean;
}

// ✅ Use proper extension
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariants {
  isLoading?: boolean;
}
```

2. Use utility types for better type safety:
```typescript
type WithLoading<T> = T & { isLoading?: boolean };
type ButtonProps = WithLoading<ButtonHTMLAttributes<HTMLButtonElement>>;
```

### Best Practices for Component Types

1. **Centralize Type Definitions**:
```typescript
// In types/components.d.ts
type BaseComponentProps = {
  className?: string;
  children?: ReactNode;
};

type LoadingState = {
  isLoading?: boolean;
  loadingText?: string;
};
```

2. **Use Module Augmentation**:
```typescript
declare module '@/components/ui/button' {
  export interface ButtonProps extends BaseComponentProps, LoadingState {
    // Component-specific props
  }
}
```

3. **Forward Ref Pattern**:
```typescript
const Component = forwardRef<HTMLElement, ComponentProps>(function Component(
  props: ComponentProps,
  ref: ForwardedRef<HTMLElement>
) {
  // Implementation
});
Component.displayName = "Component";
```

4. **Variant Handling**:
```typescript
const variants = cva("base-classes", {
  variants: {
    intent: {
      primary: "primary-classes",
      secondary: "secondary-classes"
    },
    size: {
      sm: "text-sm",
      lg: "text-lg"
    }
  },
  compoundVariants: [
    {
      intent: "primary",
      size: "lg",
      class: "compound-classes"
    }
  ],
  defaultVariants: {
    intent: "primary",
    size: "sm"
  }
});

type ComponentVariants = VariantProps<typeof variants>;
```

5. **Type Guards for Props**:
```typescript
function hasVariant(props: ComponentProps): props is Required<Pick<ComponentProps, 'variant'>> {
  return 'variant' in props && props.variant !== undefined;
}
```

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Next.js TypeScript Documentation](https://nextjs.org/docs/basic-features/typescript)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev/)
- [Next.js Server Actions Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)

## Supabase Integration Errors

### Error: Cannot find module '@supabase/auth-helpers-nextjs'

**Error Message:**
```typescript
Cannot find module '@supabase/auth-helpers-nextjs' or its corresponding type declarations
```

**Solution:**
Install the required Supabase dependencies:
```bash
pnpm remove @supabase/auth-helpers-nextjs
pnpm add @supabase/ssr
```

2. Update imports and client creation:
```typescript
// Old imports
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// New imports
import { createBrowserClient } from '@supabase/ssr'

// Old client creation
const supabase = createClientComponentClient();

// New client creation
const supabase = createBrowserClient();
```

3. For server components, use:
```typescript
import { createServerClient } from '@supabase/ssr'
```

**Explanation:**
The `@supabase/auth-helpers-nextjs` package has been deprecated in favor of `@supabase/ssr`. The new package provides better type safety and improved integration with Next.js Server Components and Server Actions. The main changes are:
- `createClientComponentClient` becomes `createBrowserClient`
- `createServerComponentClient` becomes `createServerClient`
- Improved TypeScript support and better error handling
- Better integration with Next.js App Router

### Error: Type checking Supabase errors

**Error Message:**
```typescript
'error instanceof AuthError' is not a valid type guard
```

**Solution:**
Use proper type guards for Supabase errors:
```typescript
function isAuthError(error: unknown): error is AuthError {
  return error instanceof Error && 'status' in error;
}

try {
  // Supabase operation
} catch (error) {
  if (isAuthError(error)) {
    return { error: error.message };
  }
  return { error: 'An unexpected error occurred' };
}
```

### Error: Type-safe Supabase client

**Error Message:**
```typescript
Property 'user' does not exist on type 'Session'
```

**Solution:**
Use proper type imports and client creation:
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

const supabase = createClientComponentClient<Database>()
```

## Advanced Component Patterns

### 1. Compound Components with Type Safety

**Pattern:**
```typescript
// ✅ Type-safe compound component pattern
interface AccordionRootProps extends ComponentPropsWithoutRef<"div"> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

interface AccordionItemProps extends ComponentPropsWithoutRef<"div"> {
  value: string;
}

const AccordionContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
} | null>(null);

export function Accordion({ defaultValue, value, onValueChange, ...props }: AccordionRootProps) {
  return (
    <AccordionContext.Provider value={{ value, onValueChange }}>
      <div {...props} />
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, children, ...props }: AccordionItemProps) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error("AccordionItem must be used within Accordion");
  // Implementation
}
```

### 2. Polymorphic Components

**Pattern:**
```typescript
// ✅ Type-safe polymorphic component
type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = {}
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

function Text<C extends React.ElementType = "span">({ 
  as,
  children,
  ...props
}: PolymorphicComponentProp<C>) {
  const Component = as || "span";
  return <Component {...props}>{children}</Component>;
}
```

### 3. Controlled Components with Type Safety

**Pattern:**
```typescript
// ✅ Type-safe controlled component pattern
interface ControlledInputProps extends Omit<InputProps, 'value' | 'defaultValue'> {
  value: string;
  onChange: (value: string) => void;
}

interface UncontrolledInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

// Type guard to check if component is controlled
function isControlled(
  props: ControlledInputProps | UncontrolledInputProps
): props is ControlledInputProps {
  return 'value' in props;
}

function Input(props: ControlledInputProps | UncontrolledInputProps) {
  const [internalValue, setInternalValue] = useState(
    isControlled(props) ? props.value : props.defaultValue ?? ''
  );
  // Implementation
}
```

### 4. Type-Safe Event Handlers

**Pattern:**
```typescript
// ✅ Type-safe event handlers
type InputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;
type FormSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => void;

interface FormProps {
  onSubmit: (data: FormData) => Promise<void>;
  onError?: (error: Error) => void;
}

function Form({ onSubmit, onError }: FormProps) {
  const handleSubmit: FormSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(new FormData(e.currentTarget));
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  };
}
```

### 5. Type-Safe Context with Error Handling

**Pattern:**
```typescript
// ✅ Type-safe context with error handling
interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

interface AuthContext extends AuthState {
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContext | null>(null);

function useAuth(): AuthContext {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### 6. Type-Safe Server Actions

**Pattern:**
```typescript
// ✅ Type-safe server action pattern
interface ActionState<T = unknown> {
  data?: T;
  error?: string;
  success?: string;
  validationErrors?: Record<string, string[]>;
}

type ActionHandler<T> = (
  prevState: ActionState<T>,
  formData: FormData
) => Promise<ActionState<T>>;

function createSafeAction<T>(handler: ActionHandler<T>) {
  return async (prevState: ActionState<T>, formData: FormData) => {
    try {
      return await handler(prevState, formData);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'An error occurred'
      };
    }
  };
}
```

### 7. Type-Safe Variants with CVA

**Pattern:**
```typescript
// ✅ Type-safe component variants
const variants = cva(
  "base-classes",
  {
    variants: {
      intent: {
        primary: "primary-classes",
        secondary: "secondary-classes"
      },
      size: {
        sm: "text-sm",
        lg: "text-lg"
      }
    },
    compoundVariants: [
      {
        intent: "primary",
        size: "lg",
        class: "compound-classes"
      }
    ],
    defaultVariants: {
      intent: "primary",
      size: "sm"
    }
  }
);

type ComponentVariants = VariantProps<typeof variants>;

interface ComponentProps extends ComponentVariants {
  className?: string;
}

function Component({ intent, size, className }: ComponentProps) {
  return <div className={variants({ intent, size, className })} />;
}
```

### 8. Type-Safe Form Validation

**Pattern:**
```typescript
// ✅ Type-safe form validation with Zod
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

function validateForm(data: unknown): FormData {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(result.error.message);
  }
  return result.data;
}

const handleSubmit = async (prevState: ActionState, formData: FormData) => {
  try {
    const data = validateForm(Object.fromEntries(formData));
    // Process validated data
    return { success: 'Form submitted successfully' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Invalid form data' };
  }
};
```

### 9. Type-Safe Hooks

**Pattern:**
```typescript
// ✅ Type-safe custom hooks
function useAsync<T, E = Error>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [state, setState] = useState<{
    data?: T;
    error?: E;
    loading: boolean;
  }>({
    loading: true
  });

  useEffect(() => {
    const execute = async () => {
      try {
        const data = await asyncFn();
        setState({ data, loading: false });
      } catch (error) {
        setState({ 
          error: error instanceof Error ? error : new Error('Unknown error'),
          loading: false 
        });
      }
    };
    execute();
  }, deps);

  return state;
}
```

### 10. Type-Safe Utility Functions

**Pattern:**
```typescript
// ✅ Type-safe utility functions
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;

function typeSafeObjectKeys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

function typeSafePickProperties<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}
```

### Important: Always Verify components.d.ts First

Before making any changes to component files, especially when working with Radix UI components, always verify the type declarations in `components.d.ts`. This file serves as the source of truth for component types and can prevent many common TypeScript errors.

**Steps to Verify**:
1. Check if the component has existing type declarations in `components.d.ts`
2. Verify that the declarations match the actual component implementation
3. Ensure proper type imports are present at the top of the file
4. Check for any namespace conflicts or duplicate declarations

### Error: Radix UI Component Type Errors

**Error Message:**
```typescript
Property 'Root' does not exist on type 'typeof import("@radix-ui/react-dialog")'.
Property 'className' does not exist on type 'DialogOverlayProps'.
Property 'Provider' does not exist on type 'typeof import("@radix-ui/react-tooltip")'.
```

**Solution:**
1. First, verify type declarations in `components.d.ts`:
```typescript
// In components.d.ts
declare module '@/components/ui/tooltip' {
  export interface TooltipProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> {}
  export interface TooltipTriggerProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger> {}
  // ... other type declarations
}
```

2. Use proper namespace imports for Radix primitives:
```typescript
// ✅ Correct
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

// ❌ Incorrect
import { Root, Trigger, Content } from "@radix-ui/react-tooltip"
```

3. Create local constants for exports:
```typescript
// ✅ Correct
const Tooltip = TooltipPrimitive.Root
const TooltipProvider = TooltipPrimitive.Provider

export {
  Tooltip,
  TooltipProvider,
  // ... other exports
}

// ❌ Incorrect
export {
  TooltipPrimitive.Root as Tooltip,
  TooltipPrimitive.Provider as TooltipProvider,
}
```

**Explanation:**
- Radix UI components use a namespace pattern that requires proper type declarations
- Always create local constants for exports to avoid namespace conflicts
- Verify type declarations in components.d.ts before making changes
- Follow the established pattern from working components (e.g., Dialog, DropdownMenu)

### Error: Migrating from @supabase/auth-helpers-nextjs to @supabase/ssr

**Error Message:**
```typescript
Module not found: Can't resolve '@supabase/auth-helpers-nextjs'
```

**Solution:**
1. Remove the deprecated package and install the new one:
```bash
pnpm remove @supabase/auth-helpers-nextjs
pnpm add @supabase/ssr
```

2. Update imports and client creation:
```typescript
// Old imports
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// New imports
import { createBrowserClient } from '@supabase/ssr'

// Old client creation
const supabase = createClientComponentClient();

// New client creation
const supabase = createBrowserClient();
```

3. For server components, use:
```typescript
import { createServerClient } from '@supabase/ssr'
```

**Explanation:**
The `@supabase/auth-helpers-nextjs` package has been deprecated in favor of `@supabase/ssr`. The new package provides better type safety and improved integration with Next.js Server Components and Server Actions. The main changes are:
- `createClientComponentClient` becomes `createBrowserClient`
- `createServerComponentClient` becomes `createServerClient`
- Improved TypeScript support and better error handling
- Better integration with Next.js App Router

### Error: Module Resolution and Import Patterns

**Error Message:**
```
Cannot find module 'clsx' or its corresponding type declarations.
Cannot find module 'tailwind-merge' or its corresponding type declarations.
```

**Solution:**
1. Update tsconfig.json moduleResolution:
```typescript
{
  "compilerOptions": {
    "moduleResolution": "node",
    // Instead of "bundler" which might cause issues with some packages
  }
}
```

2. Use explicit type imports:
```typescript
// ❌ Incorrect - Combined type and value imports
import { type ClassValue, clsx } from "clsx"

// ✅ Correct - Separate type and value imports
import type { ClassValue } from "clsx"
import { clsx } from "clsx"
```

3. Verify package installation:
```bash
# Check if packages are properly installed
pnpm install clsx tailwind-merge

# Clear node_modules and reinstall if needed
rm -rf node_modules .next
pnpm install
```

**Explanation:**
Modern TypeScript packages often include their own type definitions. When encountering module resolution errors:
1. Use "node" moduleResolution for better compatibility
2. Separate type imports from value imports
3. Ensure packages are properly installed
4. Clear and reinstall dependencies if issues persist

### Best Practices for Module Resolution

1. **TypeScript Configuration**:
```typescript
{
  "compilerOptions": {
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

2. **Import Patterns**:
```typescript
// ✅ Recommended import patterns
import type { SomeType } from 'package'        // Type imports
import { someFunction } from 'package'         // Value imports
import { twMerge } from 'tailwind-merge'      // Named imports
import someDefault from 'package'              // Default imports

// ❌ Avoid these patterns
import * as Package from 'package'             // Namespace imports (unless required)
import { type SomeType, someFunction } from 'package' // Mixed type/value imports
```

3. **Type Resolution**:
- Always check if a package includes its own type definitions
- Use explicit type imports with the `type` keyword
- Keep type imports separate from value imports
- Use proper path aliases for internal imports

4. **Common Issues**:
- Module not found errors often indicate installation issues
- Type declaration conflicts can occur with mixed import styles
- Path alias issues can cause module resolution failures
- Case sensitivity can cause issues on different operating systems
``` 