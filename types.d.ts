/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="node" />
/// <reference types="@testing-library/jest-dom" />

declare module 'react' {
  interface JSX {
    IntrinsicElements: any;
  }
  
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<any>): void;
  export function useMemo<T>(factory: () => T, deps: ReadonlyArray<any> | undefined): T;

  // Add Suspense component
  export interface SuspenseProps {
    children?: ReactNode;
    fallback?: ReactNode;
  }
  export const Suspense: (props: SuspenseProps) => ReactElement | null;

  // Fix component type definitions
  export type FC<P = {}> = FunctionComponent<P>;
  export type FunctionComponent<P = {}> = (props: PropsWithChildren<P>) => ReactElement | null;
  export type ComponentType<P = {}> = FunctionComponent<P>;
  export type ElementType = keyof JSX.IntrinsicElements | ComponentType<any>;
  
  // Add proper ReactNode and ReactPortal types
  export type ReactPortal = {
    children?: ReactNode;
    containerInfo: any;
    implementation: any;
    key: null | string;
  };
  
  export type ReactNode = 
    | ReactElement
    | ReactPortal
    | string
    | number
    | boolean
    | null
    | undefined
    | Iterable<ReactNode>;
}

// Add Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveAttribute(attr: string, value?: string): R;
    }
  }
}

declare module '@radix-ui/react-dialog' {
  import * as React from 'react';

  interface DialogRootProps {
    children?: React.ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?(open: boolean): void;
    modal?: boolean;
  }

  interface DialogTriggerProps {
    children?: React.ReactNode;
    asChild?: boolean;
  }

  interface DialogPortalProps {
    children?: React.ReactNode;
    container?: HTMLElement;
    forceMount?: true;
  }

  interface DialogOverlayProps {
    children?: React.ReactNode;
    asChild?: boolean;
    forceMount?: true;
  }

  interface DialogContentProps {
    children?: React.ReactNode;
    asChild?: boolean;
    forceMount?: true;
    onOpenAutoFocus?(event: Event): void;
    onCloseAutoFocus?(event: Event): void;
    onEscapeKeyDown?(event: KeyboardEvent): void;
    onPointerDownOutside?(event: PointerEvent): void;
    onInteractOutside?(event: PointerEvent | FocusEvent): void;
    side?: 'top' | 'right' | 'bottom' | 'left';
    className?: string;
  }

  interface DialogTitleProps {
    children?: React.ReactNode;
    asChild?: boolean;
  }

  interface DialogDescriptionProps {
    children?: React.ReactNode;
    asChild?: boolean;
  }

  interface DialogCloseProps {
    children?: React.ReactNode;
    asChild?: boolean;
  }

  export const Root: React.FC<DialogRootProps>;
  export const Trigger: React.ForwardRefExoticComponent<DialogTriggerProps & React.RefAttributes<HTMLButtonElement>>;
  export const Portal: React.FC<DialogPortalProps>;
  export const Overlay: React.ForwardRefExoticComponent<DialogOverlayProps & React.RefAttributes<HTMLDivElement>>;
  export const Content: React.ForwardRefExoticComponent<DialogContentProps & React.RefAttributes<HTMLDivElement>>;
  export const Title: React.ForwardRefExoticComponent<DialogTitleProps & React.RefAttributes<HTMLHeadingElement>>;
  export const Description: React.ForwardRefExoticComponent<DialogDescriptionProps & React.RefAttributes<HTMLParagraphElement>>;
  export const Close: React.ForwardRefExoticComponent<DialogCloseProps & React.RefAttributes<HTMLButtonElement>>;
}

declare module '@radix-ui/react-tooltip' {
  export interface TooltipProps extends React.PropsWithChildren {
    delayDuration?: number;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
  
  export interface TooltipContentProps extends React.PropsWithChildren {
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
  }

  export const TooltipProvider: React.FC<React.PropsWithChildren<{ delayDuration?: number }>>;
  export const Tooltip: React.FC<TooltipProps>;
  export const TooltipTrigger: React.FC<React.PropsWithChildren>;
  export const TooltipContent: React.FC<TooltipContentProps>;
}

declare module '@/components/theme-provider' {
  export interface ThemeProviderProps {
    children: React.ReactNode;
    attribute?: string;
    defaultTheme?: string;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
  }
  export const ThemeProvider: React.FC<ThemeProviderProps>;
}

declare module '@/lib/auth' {
  export interface AuthProviderProps {
    children: React.ReactNode;
  }
  export const AuthProvider: React.FC<AuthProviderProps>;
}

declare module '@/components/ui/sonner' {
  export interface CustomToasterProps {
    closeButton?: boolean;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  }
  export const Toaster: React.FC<CustomToasterProps>;
}

declare module '@/components/login-form' {
  export interface LoginFormProps extends Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'ref'> {
    mode?: 'signin' | 'signup';
  }
  export const LoginForm: React.FC<LoginFormProps>;
}

declare module 'lucide-react';
declare module '@supabase/ssr';
declare module 'tailwindcss';
declare module 'next/navigation' {
  export function redirect(url: string): never;
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    refresh: () => void;
    back: () => void;
  };
}
declare module 'tailwindcss-animate'; 