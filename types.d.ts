/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="node" />

declare module 'react' {
  interface JSX {
    IntrinsicElements: any;
  }
  
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<any>): void;
  export function useActionState<State, Payload>(
    action: (state: State, payload: Payload) => Promise<State>,
    initialState: State
  ): [State, (payload: Payload) => void, boolean];
}

declare module '@radix-ui/react-tooltip' {
  export interface TooltipProps {
    children?: React.ReactNode;
    delayDuration?: number;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
  
  export interface TooltipContentProps {
    children?: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
  }
}

declare module '@radix-ui/react-dialog' {
  export interface DialogContentProps {
    children?: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    className?: string;
  }
}

declare module 'lucide-react';
declare module '@supabase/ssr';
declare module 'tailwindcss';
declare module 'next/navigation';
declare module 'tailwindcss-animate'; 