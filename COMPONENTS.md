# Component Type System Documentation

## Overview

Our component type system is built on top of shadcn/ui and Radix UI primitives, providing a consistent and type-safe way to use components across the application. This document outlines the type system architecture, patterns, and usage guidelines.

## Core Concepts

### 1. Type Extension Pattern
All our components follow a consistent pattern for type definitions:

```typescript
// Base component with Radix UI primitive
interface ComponentProps extends React.ComponentPropsWithoutRef<typeof RadixPrimitive> {
  // Additional custom props
}

// HTML element based component
interface ComponentProps extends React.HTMLAttributes<HTMLElement> {
  // Additional custom props
}
```

### 2. Variant Support
Components that support variants use `class-variance-authority`:

```typescript
interface ComponentProps extends VariantProps<typeof componentVariants> {
  variant?: 'default' | 'outline' | /* other variants */;
  size?: 'sm' | 'default' | 'lg';
}
```

## Component Types

### Dialog Component
```typescript
interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  children?: React.ReactNode;
}
```
- Supports children for content
- Extends Radix UI Dialog primitive
- Handles modal content and positioning

### Tooltip Component
```typescript
interface TooltipContentProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  children?: React.ReactNode;
  sideOffset?: number;
}
```
- Supports positioning with sideOffset
- Handles tooltip content and triggers
- Extends Radix UI Tooltip primitive

### Input Component
```typescript
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'suffix'> {
  error?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  variant?: 'default' | 'outline' | 'filled';
  size?: 'default' | 'sm' | 'lg';
  rounded?: 'default' | 'full';
}
```
- Supports error states
- Handles prefix/suffix elements
- Multiple size and style variants

### Button Component
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'orange';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  fullWidth?: boolean;
}
```
- Multiple style variants
- Loading state support
- Size variations
- Full width option

## Usage Guidelines

### 1. Component Implementation
```typescript
const Component = React.forwardRef<HTMLElement, ComponentProps>((props, ref) => {
  // Implementation
});
```

### 2. Variant Usage
```typescript
const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        // other variants
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
```

### 3. Type Safety Best Practices
- Always use TypeScript's strict mode
- Explicitly define children types
- Use proper HTML element types
- Leverage React.forwardRef for ref handling

## Common Patterns

### 1. Compound Components
```typescript
interface RootProps { /* ... */ }
interface SubComponentProps { /* ... */ }

const Root = React.forwardRef<HTMLElement, RootProps>((props, ref) => {});
const SubComponent = React.forwardRef<HTMLElement, SubComponentProps>((props, ref) => {});

export { Root, SubComponent };
```

### 2. Variant Props
```typescript
type VariantProp = {
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
};
```

## Type System Benefits

1. **Type Safety**
   - Catch errors at compile time
   - Proper prop type checking
   - Autocomplete support

2. **Consistency**
   - Standardized component APIs
   - Predictable prop patterns
   - Reusable type definitions

3. **Developer Experience**
   - Better IDE support
   - Clear component contracts
   - Self-documenting code

## Migration Guide

When migrating existing components to use our type system:

1. Add proper type extensions
2. Implement React.forwardRef
3. Add variant support if needed
4. Update prop types to match standards
5. Add proper JSDoc documentation

## Testing Types

```typescript
import { expectType } from 'tsd';

// Example type test
expectType<ButtonProps>({
  variant: 'primary',
  size: 'sm',
  onClick: () => {},
});
```

## Advanced Component Examples

### 1. Form Components with Validation
```typescript
// Input with Zod validation
interface ValidatedInputProps extends InputProps {
  validation?: z.ZodSchema;
  onValidation?: (isValid: boolean, value: string) => void;
}

const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ validation, onValidation, ...props }, ref) => {
    const [error, setError] = useState<string | null>(null);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (validation) {
        try {
          validation.parse(e.target.value);
          setError(null);
          onValidation?.(true, e.target.value);
        } catch (err) {
          setError(err.message);
          onValidation?.(false, e.target.value);
        }
      }
    };

    return (
      <div className="space-y-1">
        <Input ref={ref} {...props} onChange={handleChange} />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);
```

### 2. Compound Components with Context
```typescript
// Tabs with compound components
interface TabsContext {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = React.createContext<TabsContext | null>(null);

interface TabsProps {
  defaultTab?: string;
  children: React.ReactNode;
  onChange?: (tabId: string) => void;
}

const Tabs = ({ defaultTab, children, onChange }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      {children}
    </TabsContext.Provider>
  );
};

interface TabProps {
  id: string;
  children: React.ReactNode;
}

const Tab = ({ id, children }: TabProps) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');

  return (
    <button
      className={cn(
        'px-4 py-2 rounded-t-lg',
        context.activeTab === id ? 'bg-primary text-white' : 'bg-muted'
      )}
      onClick={() => context.setActiveTab(id)}
    >
      {children}
    </button>
  );
};
```

### 3. Higher-Order Component Pattern
```typescript
// WithLoading HOC
interface WithLoadingProps {
  loading?: boolean;
}

function withLoading<T extends WithLoadingProps>(
  WrappedComponent: React.ComponentType<T>
) {
  return function WithLoadingComponent(
    props: Omit<T, keyof WithLoadingProps> & WithLoadingProps
  ) {
    if (props.loading) {
      return (
        <div className="animate-pulse">
          <div className="h-[inherit] w-[inherit] bg-muted rounded" />
        </div>
      );
    }
    return <WrappedComponent {...(props as T)} />;
  };
}

// Usage
const LoadingButton = withLoading(Button);
```

## Testing Patterns

### 1. Component Unit Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct variants', () => {
    const { rerender } = render(<Button variant="default">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');

    rerender(<Button variant="orange">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-orange-500');
  });

  it('handles loading state', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### 2. Hook Tests
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useToast } from './useToast';

describe('useToast', () => {
  it('manages toast state correctly', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.show({ title: 'Test Toast' });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Test Toast');
  });
});
```

### 3. Integration Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Form } from './Form';

describe('Form Integration', () => {
  it('validates and submits form data', async () => {
    const onSubmit = jest.fn();
    render(<Form onSubmit={onSubmit} />);

    await fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });

    await fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
  });
});
```

## Performance Patterns

### 1. Memoization
```typescript
interface ExpensiveComponentProps {
  data: ComplexData;
  onAction: (id: string) => void;
}

const ExpensiveComponent = React.memo<ExpensiveComponentProps>(
  ({ data, onAction }) => {
    const processedData = useMemo(() => processData(data), [data]);

    const handleAction = useCallback((id: string) => {
      onAction(id);
    }, [onAction]);

    return (
      // Component implementation
    );
  }
);
```

### 2. Dynamic Imports
```typescript
const DynamicChart = dynamic(() => import('./Chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

interface ChartProps {
  data: ChartData;
}

const Chart = ({ data }: ChartProps) => {
  // Chart implementation
};
```

These patterns demonstrate:
1. Complex form handling with validation
2. State management with context
3. Component composition
4. Performance optimization
5. Comprehensive testing strategies 

## Error Handling Patterns

### 1. Boundary Components
```typescript
interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Usage with hooks
const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  FallbackComponent: React.ComponentType<{ error: Error }>
) => {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary
        fallback={<FallbackComponent error={new Error('Component Error')} />}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};
```

### 2. Async Error Handling
```typescript
interface AsyncBoundaryProps<T> {
  children: React.ReactNode;
  loading: React.ReactNode;
  error: React.ComponentType<{ error: Error; retry: () => void }>;
  promise: () => Promise<T>;
}

function AsyncBoundary<T>({ children, loading, error: ErrorComponent, promise }: AsyncBoundaryProps<T>) {
  const [state, setState] = useState<'loading' | 'error' | 'success'>('loading');
  const [error, setError] = useState<Error | null>(null);

  const load = async () => {
    try {
      setState('loading');
      await promise();
      setState('success');
    } catch (e) {
      setError(e as Error);
      setState('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (state === 'loading') return loading;
  if (state === 'error' && error) return <ErrorComponent error={error} retry={load} />;
  return <>{children}</>;
}

// Usage
const DataComponent = () => (
  <AsyncBoundary
    promise={() => fetchData()}
    loading={<Skeleton />}
    error={({ error, retry }) => (
      <div className="space-y-2">
        <p className="text-destructive">{error.message}</p>
        <Button onClick={retry}>Retry</Button>
      </div>
    )}
  >
    <DataDisplay />
  </AsyncBoundary>
);
```

## Server Action Patterns

### 1. Type-Safe Server Actions
```typescript
'use server'

import { z } from 'zod';
import { createSafeAction } from '@/lib/safe-action';

const inputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const outputSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
  }),
  token: z.string(),
});

export const loginAction = createSafeAction(inputSchema, outputSchema, async (data) => {
  try {
    const { email, password } = data;
    const user = await authenticateUser(email, password);
    const token = await generateToken(user);
    
    return {
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    };
  } catch (error) {
    throw new Error('Authentication failed');
  }
});

// Client usage
'use client'

interface LoginFormProps {
  onSuccess?: (data: { user: { id: string; email: string }; token: string }) => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [pending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await loginAction({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      });

      if (result.success) {
        onSuccess?.(result.data);
      } else {
        // Handle validation errors
        console.error(result.error);
      }
    });
  };

  return (
    <form action={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### 2. Optimistic Updates with Server Actions
```typescript
interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

interface TodoListProps {
  initialTodos: Todo[];
}

const TodoList = ({ initialTodos }: TodoListProps) => {
  const [todos, setTodos] = useState(initialTodos);
  const [pending, startTransition] = useTransition();

  const toggleTodo = async (id: string) => {
    // Optimistic update
    const todoIndex = todos.findIndex(todo => todo.id === id);
    const newTodos = [...todos];
    newTodos[todoIndex] = {
      ...newTodos[todoIndex],
      completed: !newTodos[todoIndex].completed,
    };
    setTodos(newTodos);

    startTransition(async () => {
      try {
        await updateTodoAction(id);
      } catch (error) {
        // Revert on error
        setTodos(todos);
        toast.error('Failed to update todo');
      }
    });
  };

  return (
    <ul className="space-y-2">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={toggleTodo}
          disabled={pending}
        />
      ))}
    </ul>
  );
};
```

## Advanced Pattern Examples

### 1. Controlled vs Uncontrolled Components
```typescript
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ value, defaultValue, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue ?? '');
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    };

    return (
      <input
        ref={ref}
        value={currentValue}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
```

### 2. Composition with Render Props
```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  getKey: (item: T) => string | number;
}

function List<T>({ items, renderItem, renderEmpty, getKey }: ListProps<T>) {
  if (items.length === 0 && renderEmpty) {
    return renderEmpty();
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={getKey(item)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

// Usage
const TodoList = () => (
  <List
    items={todos}
    getKey={todo => todo.id}
    renderItem={todo => <TodoItem todo={todo} />}
    renderEmpty={() => <EmptyState />}
  />
);
```

### 3. Polymorphic Components
```typescript
type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = {}
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

type PolymorphicRef<C extends React.ElementType> = React.ComponentPropsWithRef<C>['ref'];

type PolymorphicComponentPropWithRef<
  C extends React.ElementType,
  Props = {}
> = PolymorphicComponentProp<C, Props> & { ref?: PolymorphicRef<C> };

type TextProps<C extends React.ElementType> = PolymorphicComponentPropWithRef<
  C,
  { variant?: 'heading' | 'body' | 'caption' }
>;

type TextComponent = <C extends React.ElementType = 'span'>(
  props: TextProps<C>
) => React.ReactElement | null;

const Text: TextComponent = React.forwardRef(
  <C extends React.ElementType = 'span'>(
    { as, variant = 'body', className, children, ...props }: TextProps<C>,
    ref?: PolymorphicRef<C>
  ) => {
    const Component = as || 'span';
    const styles = {
      heading: 'text-2xl font-bold',
      body: 'text-base',
      caption: 'text-sm text-muted-foreground',
    };

    return (
      <Component
        ref={ref}
        className={cn(styles[variant], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

// Usage
<Text as="h1" variant="heading">Title</Text>
<Text as="p" variant="body">Content</Text>
<Text as="label" variant="caption">Label</Text>
```

These patterns demonstrate:
1. Robust error handling with boundaries
2. Type-safe server actions with Zod validation
3. Optimistic updates with proper error recovery
4. Advanced component patterns with TypeScript
5. Flexible and reusable component architectures 

## Real-World Use Cases

### 1. Infinite Scroll with Virtual List
```typescript
interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  windowHeight: number;
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
}

function VirtualList<T>({
  items,
  renderItem,
  itemHeight,
  windowHeight,
  onLoadMore,
  hasMore
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [loading, startTransition] = useTransition();

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(windowHeight / itemHeight),
      items.length
    );
    
    return items
      .slice(startIndex, endIndex)
      .map((item, index) => renderItem(item, startIndex + index));
  }, [items, scrollTop, windowHeight, itemHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setScrollTop(scrollTop);

    if (!loading && hasMore && scrollHeight - scrollTop <= clientHeight * 1.5) {
      startTransition(() => {
        onLoadMore();
      });
    }
  }, [hasMore, loading, onLoadMore]);

  return (
    <div
      className="overflow-auto"
      style={{ height: windowHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight }}>
        <div
          style={{
            transform: `translateY(${Math.floor(scrollTop / itemHeight) * itemHeight}px)`
          }}
        >
          {visibleItems}
        </div>
      </div>
      {loading && <LoadingSpinner />}
    </div>
  );
}

// Usage
const ItemList = () => {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['items'],
    queryFn: ({ pageParam = 1 }) => fetchItems(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage
  });

  const items = useMemo(() => 
    data?.pages.flatMap(page => page.items) ?? [], 
    [data]
  );

  return (
    <VirtualList
      items={items}
      renderItem={(item) => <ItemCard item={item} />}
      itemHeight={100}
      windowHeight={600}
      onLoadMore={() => fetchNextPage()}
      hasMore={!!hasNextPage}
    />
  );
};
```

### 2. Complex Form with Dynamic Fields
```typescript
interface DynamicFormField {
  id: string;
  type: 'text' | 'number' | 'select';
  label: string;
  options?: { value: string; label: string }[];
  validation?: z.ZodType<any>;
  dependent?: {
    field: string;
    value: string;
    action: 'show' | 'hide';
  };
}

interface DynamicFormProps {
  fields: DynamicFormField[];
  onSubmit: (values: Record<string, any>) => Promise<void>;
}

const DynamicForm = ({ fields, onSubmit }: DynamicFormProps) => {
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, startTransition] = useTransition();

  const schema = useMemo(() => {
    const shape = fields.reduce((acc, field) => {
      if (field.validation) {
        acc[field.id] = field.validation;
      }
      return acc;
    }, {} as Record<string, z.ZodType<any>>);
    
    return z.object(shape);
  }, [fields]);

  const handleChange = (id: string, value: any) => {
    setValues(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = schema.parse(values);
      startTransition(() => {
        onSubmit(validatedData);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(
          error.errors.reduce((acc, err) => {
            acc[err.path[0]] = err.message;
            return acc;
          }, {} as Record<string, string>)
        );
      }
    }
  };

  const visibleFields = fields.filter(field => {
    if (!field.dependent) return true;
    const { field: dependentField, value, action } = field.dependent;
    const matches = values[dependentField] === value;
    return action === 'show' ? matches : !matches;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {visibleFields.map(field => (
        <FormField
          key={field.id}
          field={field}
          value={values[field.id]}
          error={errors[field.id]}
          onChange={(value) => handleChange(field.id, value)}
          disabled={submitting}
        />
      ))}
      <Button type="submit" loading={submitting}>Submit</Button>
    </form>
  );
};
```

## Complex State Management

### 1. Reducer Pattern with TypeScript
```typescript
type Action =
  | { type: 'SET_VALUE'; field: string; value: any }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'CLEAR_ERROR'; field: string }
  | { type: 'SET_TOUCHED'; field: string }
  | { type: 'RESET_FORM' };

interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

const formReducer = (state: FormState, action: Action): FormState => {
  switch (action.type) {
    case 'SET_VALUE':
      return {
        ...state,
        values: {
          ...state.values,
          [action.field]: action.value
        }
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.error
        }
      };
    case 'CLEAR_ERROR':
      const { [action.field]: _, ...errors } = state.errors;
      return {
        ...state,
        errors
      };
    case 'SET_TOUCHED':
      return {
        ...state,
        touched: {
          ...state.touched,
          [action.field]: true
        }
      };
    case 'RESET_FORM':
      return {
        values: {},
        errors: {},
        touched: {},
        isSubmitting: false
      };
    default:
      return state;
  }
};

// Usage with custom hook
function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: z.ZodType<T>
) {
  const [state, dispatch] = useReducer(formReducer, {
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false
  });

  const setValue = useCallback((field: keyof T, value: any) => {
    dispatch({ type: 'SET_VALUE', field: field as string, value });
    if (validationSchema) {
      try {
        validationSchema.parse({ ...state.values, [field]: value });
        dispatch({ type: 'CLEAR_ERROR', field: field as string });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.errors.find(err => err.path[0] === field);
          if (fieldError) {
            dispatch({
              type: 'SET_ERROR',
              field: field as string,
              error: fieldError.message
            });
          }
        }
      }
    }
  }, [state.values, validationSchema]);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    setValue,
    setTouched: (field: keyof T) => 
      dispatch({ type: 'SET_TOUCHED', field: field as string }),
    reset: () => dispatch({ type: 'RESET_FORM' })
  };
}
```

### 2. Context with Async State
```typescript
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

type AsyncAction<T> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: T }
  | { type: 'FETCH_ERROR'; error: Error }
  | { type: 'RESET' };

function createAsyncReducer<T>() {
  return (state: AsyncState<T>, action: AsyncAction<T>): AsyncState<T> => {
    switch (action.type) {
      case 'FETCH_START':
        return {
          ...state,
          loading: true,
          error: null
        };
      case 'FETCH_SUCCESS':
        return {
          data: action.payload,
          loading: false,
          error: null
        };
      case 'FETCH_ERROR':
        return {
          ...state,
          loading: false,
          error: action.error
        };
      case 'RESET':
        return {
          data: null,
          loading: false,
          error: null
        };
      default:
        return state;
    }
  };
}

function createAsyncContext<T>() {
  const Context = React.createContext<{
    state: AsyncState<T>;
    dispatch: React.Dispatch<AsyncAction<T>>;
  } | null>(null);

  function Provider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(createAsyncReducer<T>(), {
      data: null,
      loading: false,
      error: null
    });

    return (
      <Context.Provider value={{ state, dispatch }}>
        {children}
      </Context.Provider>
    );
  }

  function useAsync() {
    const context = useContext(Context);
    if (!context) {
      throw new Error('useAsync must be used within an AsyncProvider');
    }
    return context;
  }

  return { Provider, useAsync };
}

// Usage
const { Provider: UserProvider, useAsync: useUser } = createAsyncContext<User>();

function UserProfile() {
  const { state, dispatch } = useUser();

  useEffect(() => {
    const fetchUser = async () => {
      dispatch({ type: 'FETCH_START' });
      try {
        const user = await fetchUserData();
        dispatch({ type: 'FETCH_SUCCESS', payload: user });
      } catch (error) {
        dispatch({ type: 'FETCH_ERROR', error: error as Error });
      }
    };
    fetchUser();
  }, []);

  if (state.loading) return <Skeleton />;
  if (state.error) return <ErrorMessage error={state.error} />;
  if (!state.data) return null;

  return <UserCard user={state.data} />;
}
```

## Testing Complex Patterns

### 1. Testing Async Components
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VirtualList } from './VirtualList';

describe('VirtualList', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    title: `Item ${i}`
  }));

  const mockOnLoadMore = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock IntersectionObserver
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  it('renders visible items and loads more on scroll', async () => {
    const { container } = render(
      <VirtualList
        items={mockItems}
        renderItem={(item) => <div>{item.title}</div>}
        itemHeight={50}
        windowHeight={300}
        onLoadMore={mockOnLoadMore}
        hasMore={true}
      />
    );

    // Initial render should show first few items
    expect(screen.getByText('Item 0')).toBeInTheDocument();
    expect(screen.getByText('Item 5')).toBeInTheDocument();
    
    // Scroll to bottom
    const scrollContainer = container.firstChild as HTMLElement;
    await userEvent.scroll(scrollContainer, { target: { scrollTop: 1000 } });

    // Should trigger load more
    await waitFor(() => {
      expect(mockOnLoadMore).toHaveBeenCalled();
    });
  });
});
```

### 2. Testing Form Validation
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DynamicForm } from './DynamicForm';
import { z } from 'zod';

describe('DynamicForm', () => {
  const fields = [
    {
      id: 'email',
      type: 'text',
      label: 'Email',
      validation: z.string().email()
    },
    {
      id: 'age',
      type: 'number',
      label: 'Age',
      validation: z.number().min(18),
      dependent: {
        field: 'hasAge',
        value: 'true',
        action: 'show'
      }
    }
  ];

  const mockSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates fields and shows errors', async () => {
    render(<DynamicForm fields={fields} onSubmit={mockSubmit} />);

    // Invalid email
    await userEvent.type(screen.getByLabelText('Email'), 'invalid');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();

    // Valid email
    await userEvent.clear(screen.getByLabelText('Email'));
    await userEvent.type(
      screen.getByLabelText('Email'),
      'test@example.com'
    );
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        email: 'test@example.com'
      });
    });
  });

  it('handles dependent fields', async () => {
    render(<DynamicForm fields={fields} onSubmit={mockSubmit} />);

    // Age field should be hidden initially
    expect(screen.queryByLabelText('Age')).not.toBeInTheDocument();

    // Show age field
    await userEvent.click(screen.getByLabelText('Has Age'));
    expect(await screen.findByLabelText('Age')).toBeInTheDocument();
  });
});
```

### 3. Testing Context and Reducers
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useForm } from './useForm';
import { z } from 'zod';

describe('useForm', () => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email()
  });

  it('handles form state changes', () => {
    const { result } = renderHook(() => 
      useForm({ name: '', email: '' }, schema)
    );

    act(() => {
      result.current.setValue('name', 'Jo');
    });

    expect(result.current.values.name).toBe('Jo');
    expect(result.current.errors.name).toBe(undefined);

    act(() => {
      result.current.setValue('email', 'invalid');
    });

    expect(result.current.errors.email).toMatch(/invalid email/i);

    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual({ name: '', email: '' });
    expect(result.current.errors).toEqual({});
  });

  it('tracks touched fields', () => {
    const { result } = renderHook(() => 
      useForm({ name: '', email: '' }, schema)
    );

    act(() => {
      result.current.setTouched('name');
    });

    expect(result.current.touched.name).toBe(true);
    expect(result.current.touched.email).toBe(undefined);
  });
});
```

These examples demonstrate:
1. Real-world component implementations
2. Complex state management patterns
3. Comprehensive testing strategies
4. Type-safe form handling
5. Performance optimizations 

## Important: Type Declaration Verification

Before working with any component, especially Radix UI components, always verify the type declarations in `components.d.ts`. This is a critical step that can prevent many common TypeScript errors and ensure consistency across the codebase.

### Verification Steps
1. Check existing declarations:
```typescript
// In components.d.ts
declare module '@/components/ui/tooltip' {
  export interface TooltipProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> {}
  export interface TooltipTriggerProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger> {}
  // ... other declarations
}
```

2. Verify imports at the top of components.d.ts:
```typescript
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
// ... other imports
```

3. Check for namespace conflicts or duplicate declarations
4. Ensure proper type extension patterns are followed

### Radix UI Component Pattern
When implementing Radix UI components, follow this consistent pattern:

1. Import using namespace:
```typescript
import * as ComponentPrimitive from "@radix-ui/react-component"
```

2. Create local constants for exports:
```typescript
const Component = ComponentPrimitive.Root
const ComponentProvider = ComponentPrimitive.Provider

export {
  Component,
  ComponentProvider,
  // ... other exports
}
```

3. Use proper type extensions:
```typescript
interface ComponentProps extends React.ComponentPropsWithoutRef<typeof ComponentPrimitive.Root> {
  // Additional props
}
```

// ... existing content ... 