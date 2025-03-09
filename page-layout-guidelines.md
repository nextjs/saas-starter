# Page and Layout Guidelines

## Table of Contents
1. [Adding New Pages](#adding-new-pages)
2. [Creating Layouts](#creating-layouts)
3. [Type Safety](#type-safety)
4. [Supabase Integration](#supabase-integration)
5. [State Management](#state-management)
6. [Common Pitfalls](#common-pitfalls)
7. [Performance Considerations](#performance-considerations)
8. [Avoiding Experimental Features](#avoiding-experimental-features)
9. [UI Component Patterns](#ui-component-patterns)

## Adding New Pages

### File Structure
```
app/
├── (dashboard)/
│   └── dashboard/
│       ├── [feature]/
│       │   ├── page.tsx
│       │   └── layout.tsx
│       └── layout.tsx
└── layout.tsx
```

### Best Practices

1. **Client vs Server Components**
   ```typescript
   // Use 'use client' for client components
   'use client';
   
   // Keep components server-side by default
   // Only add 'use client' when needed for:
   // - Interactivity (useState, useEffect)
   // - Browser APIs
   // - Event handlers
   ```

2. **Type Safety**
   ```typescript
   // Always define proper interfaces for props
   interface PageProps {
     params: { id: string };
     searchParams: { [key: string]: string | string[] | undefined };
   }

   // Use proper return type for the page component
   export default function FeaturePage({ params, searchParams }: PageProps) {
     return (
       <section className="flex-1 p-4 lg:p-8">
         {/* Content */}
       </section>
     );
   }
   ```

3. **Loading States**
   ```typescript
   // Create a loading.tsx file for suspense
   export default function Loading() {
     return (
       <div className="flex-1 p-4 lg:p-8">
         <Card>
           <CardContent className="flex items-center justify-center py-8">
             <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
           </CardContent>
         </Card>
       </div>
     );
   }
   ```

## Creating Layouts

### Best Practices

1. **Type Safety for Layouts**
   ```typescript
   import type { ReactNode } from 'react';

   interface LayoutProps {
     children: ReactNode;
     params?: { id: string };
   }

   export default function FeatureLayout({ children, params }: LayoutProps) {
     return (
       <div className="flex flex-col min-h-[calc(100dvh-68px)]">
         {children}
       </div>
     );
   }
   ```

2. **Component Organization**
   ```typescript
   // Separate reusable components
   // components/feature/FeatureHeader.tsx
   interface FeatureHeaderProps {
     title: string;
     description?: string;
   }

   // Use in layout
   import { FeatureHeader } from '@/components/feature/FeatureHeader';
   ```

3. **Consistent Styling**
   ```typescript
   // Use consistent class patterns
   const layoutClasses = {
     wrapper: "flex flex-col min-h-[calc(100dvh-68px)]",
     content: "flex-1 p-4 lg:p-8",
     header: "bg-white dark:bg-gray-950 border-b",
   };
   ```

## Type Safety

### 1. Database Types
```typescript
// types/database.d.ts
interface FeatureRecord {
  id: number;
  created_at: string;
  user_id: number;
  // ... other fields
}

// Use with Supabase
const { data: features } = await supabase
  .from('features')
  .select('*')
  .returns<FeatureRecord[]>();
```

### 2. Form State Types
```typescript
// Define action state type
interface FeatureActionState {
  error?: string;
  success?: string;
  data?: FeatureRecord;
}

// Use with useActionState
const [state, action, isPending] = useActionState<FeatureActionState, FormData>(
  async (prevState, formData) => {
    // Handle action
    return { success: 'Operation completed' };
  },
  { error: '', success: '' }
);
```

### 3. Component Props
```typescript
// Ensure all props are properly typed
interface FeatureCardProps {
  feature: FeatureRecord;
  onUpdate?: (id: number) => Promise<void>;
  isLoading?: boolean;
}
```

## Supabase Integration

### 1. Type-Safe Queries
```typescript
// Define table types
type Tables = {
  features: FeatureRecord;
  feature_settings: FeatureSettingRecord;
};

// Use with queries
const { data } = await supabase
  .from('features')
  .select('*, feature_settings(*)')
  .returns<
    Tables['features'] & {
      feature_settings: Tables['feature_settings'][];
    }
  >();
```

### 2. Auth Integration
```typescript
// Always check auth state
export default function FeaturePage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return <LoadingState />;
  }

  return (
    // Your component
  );
}
```

## State Management

### 1. Server Actions
```typescript
'use server';

import { revalidatePath } from 'next/cache';

export async function updateFeature(
  prevState: FeatureActionState,
  formData: FormData
): Promise<FeatureActionState> {
  try {
    // Handle update
    revalidatePath('/dashboard/features');
    return { success: 'Feature updated' };
  } catch (error) {
    return { error: 'Failed to update feature' };
  }
}
```

### 2. Client State
```typescript
// Use hooks for client state
const [isEditing, setIsEditing] = useState(false);
const [state, action, isPending] = useActionState(updateFeature, {});

// Handle loading states
{isPending ? <LoadingState /> : <Content />}
```

## Common Pitfalls

### 1. Type Mismatches
```typescript
// ❌ Incorrect
const Icon = icons[name]; // Type 'string' can't be used to index

// ✅ Correct
const Icon = icons[name as keyof typeof icons];
```

### 2. Auth State Handling
```typescript
// ❌ Incorrect
const { user } = useAuth();
if (!user) return null; // Might flash loading state

// ✅ Correct
const { user, loading } = useAuth();
if (loading) return <LoadingState />;
if (!user) return <UnauthorizedState />;
```

### 3. Form Submissions
```typescript
// ❌ Incorrect
const handleSubmit = (e: React.FormEvent) => {
  action(new FormData(e.target)); // Error: EventTarget not guaranteed to be HTMLFormElement

// ✅ Correct
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  action(new FormData(e.currentTarget));
};
```

## Performance Considerations

### 1. Component Optimization
```typescript
// Use memo for expensive renders
const FeatureList = memo(function FeatureList({ features }: FeatureListProps) {
  return (
    // Render list
  );
});

// Use callbacks for handlers
const handleUpdate = useCallback(async (id: number) => {
  // Handle update
}, []);
```

### 2. Data Fetching
```typescript
// Use proper caching strategies
export const revalidate = 3600; // Revalidate every hour

// Or use tags for selective revalidation
export const dynamic = 'force-dynamic';
```

### 3. Loading States
```typescript
// Always provide loading states
<Suspense fallback={<LoadingState />}>
  <FeatureContent />
</Suspense>
```

## Checklist for New Pages

1. **Setup**
   - [ ] Correct file structure
   - [ ] Proper naming convention
   - [ ] Required types defined
   - [ ] Auth checks implemented

2. **Type Safety**
   - [ ] Props properly typed
   - [ ] Database types defined
   - [ ] Action states typed
   - [ ] Form event handlers typed

3. **State Management**
   - [ ] Server actions implemented
   - [ ] Client state organized
   - [ ] Loading states handled
   - [ ] Error states managed

4. **Performance**
   - [ ] Proper suspense boundaries
   - [ ] Optimized renders
   - [ ] Caching strategy defined
   - [ ] Code splitting considered

5. **Testing**
   - [ ] Component tests added
   - [ ] Server actions tested
   - [ ] Loading states verified
   - [ ] Error handling tested

## Additional Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React TypeScript Guidelines](https://react-typescript-cheatsheet.netlify.app/)
- [Supabase TypeScript Support](https://supabase.com/docs/reference/typescript-support)
- [React Server Components](https://nextjs.org/docs/getting-started/react-essentials)

## Avoiding Experimental Features

### Form Handling
```typescript
// ❌ Don't use experimental features
import { useFormStatus, useOptimistic } from 'react-dom';
import { experimental_useFormState } from 'react-dom';

// ✅ Use our stable patterns instead
import { useActionState } from '@/lib/hooks/useActionState';

// ✅ Stable form handling
function Form() {
  const [state, action, isPending] = useActionState<ActionState, FormData>(
    handleSubmit,
    initialState
  );

  return (
    <form action={action}>
      {/* Form fields */}
      <Button isLoading={isPending}>Submit</Button>
      {state.error && <p className="text-red-500">{state.error}</p>}
    </form>
  );
}
```

### Loading States
```typescript
// ❌ Don't use experimental loading hooks
import { useFormStatus } from 'react-dom';

// ✅ Use prop-based loading states
interface ButtonProps {
  isLoading?: boolean;
  children: React.ReactNode;
}

function Button({ isLoading, children }: ButtonProps) {
  return (
    <button disabled={isLoading}>
      {isLoading ? <LoadingSpinner /> : children}
    </button>
  );
}
```

### Server Actions
```typescript
// ❌ Don't use experimental server actions config
export const config = {
  runtime: 'experimental-edge',
};

// ✅ Use stable server action patterns
async function handleAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Your action logic here
    return { success: 'Operation completed' };
  } catch (error) {
    return { error: 'Operation failed' };
  }
}
```

### State Management
```typescript
// ❌ Don't use experimental optimistic updates
const [optimisticState, addOptimistic] = useOptimistic(data);

// ✅ Use stable state management
const [state, setState] = useState(data);
const [isPending, startTransition] = useTransition();

const updateData = (newData: Data) => {
  startTransition(() => {
    setState(newData);
  });
};
```

### Best Practices for Stability

1. **Form Handling**:
   - Use `useActionState` for form state management
   - Implement proper loading states through props
   - Handle errors consistently using the action state pattern

2. **Component Architecture**:
   - Keep components server-side by default
   - Only add 'use client' when necessary
   - Use stable Radix UI primitives for UI components

3. **Type Safety**:
   - Use explicit interfaces for all props
   - Avoid experimental type features
   - Maintain consistent type patterns across components

4. **Performance**:
   - Use React.memo for expensive renders
   - Implement proper Suspense boundaries
   - Use stable caching strategies

5. **Error Handling**:
   - Implement proper error boundaries
   - Use consistent error state patterns
   - Provide helpful error messages

Remember: Always choose stable, well-tested patterns over experimental features. This ensures your application remains maintainable and reliable in production.

## UI Component Patterns

### Using Radix UI Components

1. **Import Pattern**
```typescript
// ✅ Correct - Use namespace imports
import * as DialogPrimitive from "@radix-ui/react-dialog"

// ❌ Incorrect - Don't use named imports
import { Root, Trigger } from "@radix-ui/react-dialog"
```

2. **Component Structure**
```typescript
// ✅ Correct - Use proper type extensions and forwardRef
interface DialogContentProps extends DialogPrimitive.DialogContentProps {
  className?: string;
}

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => (
    <DialogPrimitive.Content
      ref={ref}
      className={cn("base-classes", className)}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  )
)

// ❌ Incorrect - Don't use FC type or skip forwardRef
const DialogContent: React.FC<DialogContentProps> = ({ className, children }) => (
  <DialogPrimitive.Content className={className}>
    {children}
  </DialogPrimitive.Content>
)
```

3. **Type Declarations**
```typescript
// In components.d.ts
declare module '@/components/ui/dialog' {
  export interface DialogProps extends DialogPrimitive.DialogProps {}
  export interface DialogContentProps extends DialogPrimitive.DialogContentProps {
    className?: string;
  }
}

// In your component
import type { DialogContentProps } from '@/components/ui/dialog'
```

### Component Best Practices

1. **Type Safety**
   - Always extend Radix UI types with our own props
   - Use proper HTML element types for refs
   - Keep type declarations in `components.d.ts`
   - Follow our established patterns for consistency

2. **Accessibility**
   - Preserve Radix UI's accessibility features
   - Maintain proper ARIA attributes
   - Keep keyboard navigation support
   - Add proper labels and descriptions

3. **Styling**
   - Use `cn` utility for class merging
   - Allow className prop for customization
   - Follow our design system tokens
   - Maintain dark mode support

4. **Error Prevention**
   - Use TypeScript's strict mode
   - Add proper prop validation
   - Handle edge cases gracefully
   - Document component usage

### Common Pitfalls

1. **Type System**
```typescript
// ❌ Common Mistakes
- Using named imports from Radix UI
- Forgetting to extend base types
- Missing className prop in type definitions
- Not using forwardRef

// ✅ Solutions
- Use namespace imports
- Extend base types properly
- Include className in type definitions
- Use forwardRef for ref handling
```

2. **Component Structure**
```typescript
// ❌ Common Mistakes
- Mixing client/server components
- Not handling loading states
- Missing error boundaries
- Skipping accessibility features

// ✅ Solutions
- Use 'use client' directive properly
- Add loading state handling
- Implement error boundaries
- Maintain accessibility features
```

3. **Type Declarations**
```typescript
// ❌ Common Mistakes
- Duplicate type declarations
- Missing prop types
- Incorrect type extensions
- Inconsistent naming

// ✅ Solutions
- Centralize types in components.d.ts
- Define all props explicitly
- Extend types correctly
- Follow naming conventions
```

### Checklist for New Components

1. **Setup**
   - [ ] Use proper namespace imports
   - [ ] Add 'use client' directive if needed
   - [ ] Define proper type extensions
   - [ ] Set up forwardRef correctly

2. **Type Safety**
   - [ ] Extend base types properly
   - [ ] Include className prop
   - [ ] Use proper HTML element types
   - [ ] Add proper prop validation

3. **Structure**
   - [ ] Follow component patterns
   - [ ] Handle loading states
   - [ ] Add error boundaries
   - [ ] Maintain accessibility

4. **Documentation**
   - [ ] Add JSDoc comments
   - [ ] Document props
   - [ ] Include usage examples
   - [ ] Update type declarations