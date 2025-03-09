import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as LabelPrimitive from '@radix-ui/react-label';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { VariantProps } from 'class-variance-authority';
import { ReactNode } from 'react';
import { AriaAttributes, DOMAttributes } from 'react';

// Common type patterns
type LoadingState = {
  isLoading?: boolean;
  loadingText?: string;
};

type BaseComponentProps = {
  className?: string;
  children?: ReactNode;
};

// Advanced type utilities
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;

type ElementType<P = any> = {
  [K in keyof JSX.IntrinsicElements]: P extends JSX.IntrinsicElements[K] ? K : never;
}[keyof JSX.IntrinsicElements];

// Polymorphic component types
type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = {}
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

// Form state types
type ValidationState = {
  valid: boolean;
  error?: string;
  touched?: boolean;
};

type FormState<T> = {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
};

// Action state types
type ActionState<T = unknown> = {
  data?: T;
  error?: string;
  success?: string;
  validationErrors?: Record<string, string[]>;
  isLoading?: boolean;
};

// Event handler types
type ChangeHandler<T = string> = (value: T) => void;
type SubmitHandler<T = unknown> = (data: T) => Promise<void>;
type ErrorHandler = (error: Error) => void;

declare global {
  namespace JSX {
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
  }
}

declare module 'react' {
  export interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    [key: string]: any;
  }
  
  export interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: 'submit' | 'reset' | 'button';
    disabled?: boolean;
  }

  export type ElementRef<T> = T extends React.ElementType
    ? React.ComponentRef<T>
    : never;

  export type ComponentPropsWithoutRef<T> = T extends React.ElementType
    ? Omit<React.ComponentProps<T>, 'ref'>
    : never;

  export type ForwardRefRenderFunction<T, P = {}> = (
    props: P,
    ref: React.Ref<T>
  ) => React.ReactElement | null;

  export function forwardRef<T, P = {}>(
    render: ForwardRefRenderFunction<T, P>
  ): React.ForwardRefExoticComponent<P & React.RefAttributes<T>>;

  // Add more type-safe event handlers
  export interface ChangeEvent<T = Element> {
    target: EventTarget & T;
  }

  export interface FormEvent<T = Element> {
    currentTarget: EventTarget & T;
  }

  // Add type-safe refs
  export type RefCallback<T> = (instance: T | null) => void;
  export type RefObject<T> = { current: T | null };
  export type Ref<T> = RefCallback<T> | RefObject<T> | null;
}

// Re-export component types
declare module '@/components/ui/alert' {
  export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, BaseComponentProps {
    variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info' | 'orange';
    size?: 'default' | 'sm' | 'lg';
  }
  export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement>, BaseComponentProps {}
  export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement>, BaseComponentProps {}
}

declare module '@/components/ui/skeleton' {
  export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    shape?: 'text' | 'heading' | 'avatar' | 'button' | 'card' | 'circle';
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    variant?: 'default' | 'orange' | 'muted';
    animation?: 'pulse' | 'shimmer' | 'none';
    count?: number;
  }
}

declare module '@/components/ui/dropdown-menu' {
  export interface DropdownMenuProps extends DropdownMenuPrimitive.DropdownMenuProps {}
  export interface DropdownMenuTriggerProps extends DropdownMenuPrimitive.DropdownMenuTriggerProps {}
  export interface DropdownMenuContentProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {
    align?: 'start' | 'center' | 'end';
    sideOffset?: number;
    className?: string;
  }
  export interface DropdownMenuLabelProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> {}
  export interface DropdownMenuItemProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> {}
  export interface DropdownMenuSeparatorProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator> {}
}

declare module '@/components/ui/dialog' {
  export interface DialogProps extends DialogPrimitive.DialogProps {}
  export interface DialogTriggerProps extends DialogPrimitive.DialogTriggerProps {}
  export interface DialogPortalProps extends DialogPrimitive.DialogPortalProps {}
  export interface DialogOverlayProps extends DialogPrimitive.DialogOverlayProps {
    className?: string;
  }
  export interface DialogContentProps extends DialogPrimitive.DialogContentProps {
    className?: string;
  }
  export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
  }
  export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
  }
  export interface DialogTitleProps extends DialogPrimitive.DialogTitleProps {
    className?: string;
  }
  export interface DialogDescriptionProps extends DialogPrimitive.DialogDescriptionProps {
    className?: string;
  }
}

declare module '@/components/ui/tooltip' {
  export interface TooltipProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> {}
  export interface TooltipTriggerProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger> {}
  export interface TooltipContentProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>, VariantProps<typeof import('./tooltip').tooltipVariants> {
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    alignOffset?: number;
    maxWidth?: number | string;
    showArrow?: boolean;
  }
  export interface TooltipProviderProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider> {
    delayDuration?: number;
  }
}

// Also add explicit type declarations for Radix UI Tooltip
declare module '@radix-ui/react-tooltip' {
  import * as React from 'react';
  import { Primitive } from '@radix-ui/react-primitive';

  export interface TooltipProps {
    children?: React.ReactNode;
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    delayDuration?: number;
    disableHoverableContent?: boolean;
  }

  export interface TooltipProviderProps {
    children?: React.ReactNode;
    delayDuration?: number;
    skipDelayDuration?: number;
    disableHoverableContent?: boolean;
  }

  export interface TooltipTriggerProps extends React.ComponentPropsWithoutRef<typeof Primitive.button> {}

  export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
    side?: "top" | "right" | "bottom" | "left";
    sideOffset?: number;
    align?: "start" | "center" | "end";
    alignOffset?: number;
    arrowPadding?: number;
    collisionBoundary?: Element | null | Array<Element>;
    collisionPadding?: number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>;
    sticky?: "partial" | boolean;
    hideWhenDetached?: boolean;
    avoidCollisions?: boolean;
  }

  export const Provider: React.FC<TooltipProviderProps>;
  export const Root: React.FC<TooltipProps>;
  export const Trigger: React.ForwardRefExoticComponent<TooltipTriggerProps & React.RefAttributes<HTMLButtonElement>>;
  export const Portal: React.FC<{ children: React.ReactNode; container?: HTMLElement }>;
  export const Content: React.ForwardRefExoticComponent<TooltipContentProps & React.RefAttributes<HTMLDivElement>>;
}

declare module '@/components/ui/input' {
  export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'suffix'> {
    error?: boolean;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    variant?: 'default' | 'outline' | 'filled';
    size?: 'default' | 'sm' | 'lg';
    rounded?: 'default' | 'full';
  }
}

declare module '@/components/ui/radio-group' {
  export interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
    orientation?: 'horizontal' | 'vertical';
  }
  export interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
    size?: 'sm' | 'default' | 'lg';
    variant?: 'default' | 'orange';
  }
  export interface RadioGroupItemTextProps extends React.HTMLAttributes<HTMLLabelElement> {
    value: string;
    children?: React.ReactNode;
  }
}

declare module '@/components/ui/button' {
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, BaseComponentProps {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'orange';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    rounded?: 'default' | 'full';
    fullWidth?: boolean;
    asChild?: boolean;
    isLoading?: boolean;
  }
}

declare module '@/components/ui/card' {
  export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'bordered' | 'elevated';
    size?: 'default' | 'sm' | 'lg';
  }
  export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
  export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
  export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
  export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
  export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
}

declare module '@/components/ui/avatar' {
  export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }
  export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    alt: string;
  }
  export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}
}

// Add AlertDialog types after the Alert types
declare module '@/components/ui/alert-dialog' {
  export interface AlertDialogProps extends AlertDialogPrimitive.AlertDialogProps {}
  export interface AlertDialogTriggerProps extends AlertDialogPrimitive.AlertDialogTriggerProps {}
  export interface AlertDialogContentProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> {
    children?: React.ReactNode;
  }
  export interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
  export interface AlertDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
  export interface AlertDialogTitleProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title> {}
  export interface AlertDialogDescriptionProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description> {}
  export interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
  export interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
}

// Add Label types after the Input types
declare module '@/components/ui/label' {
  export interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
    size?: 'default' | 'sm' | 'lg';
    error?: boolean;
    required?: boolean;
  }
}

// Common Props
export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

// Auth Types
export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Layout Types
export interface LayoutProps extends BaseProps {
  title?: string;
}

// Form Types
export interface FormProps extends BaseProps {
  onSubmit?: (data: any) => void;
  loading?: boolean;
}

// UI Component Types
export interface ButtonProps extends BaseProps {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  onClick?: () => void;
}

export interface InputProps extends BaseProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface CardProps extends BaseProps {
  title?: string;
  footer?: ReactNode;
}

// Dialog Types
export interface DialogProps extends BaseProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface DialogContentProps extends BaseProps {
  title?: string;
  description?: string;
}

declare module '@/components/ui/progress' {
  export interface ProgressProps extends React.ComponentPropsWithoutRef<typeof import('@radix-ui/react-progress').Progress> {
    value?: number;
    className?: string;
    max?: number;
  }
  export interface ProgressIndicatorProps extends React.ComponentPropsWithoutRef<typeof import('@radix-ui/react-progress').ProgressIndicator> {
    className?: string;
  }
}

declare module '@/components/ui/table' {
  export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
    className?: string;
  }

  export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
    className?: string;
  }

  export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
    className?: string;
  }

  export interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
    className?: string;
  }

  export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
    className?: string;
  }

  export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    className?: string;
  }

  export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
    className?: string;
  }

  export interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
    className?: string;
  }
}

// Add more component type declarations as needed 