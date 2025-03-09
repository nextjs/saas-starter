import * as React from 'react';

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
    interface ElementChildrenAttribute { children: {}; }
  }
}

declare module 'react' {
  // Re-export React types with proper type safety
  export type ReactNode = React.ReactNode;
  export type ReactElement<P = any, T extends string | React.JSXElementConstructor<any> = string | React.JSXElementConstructor<any>> = React.ReactElement<P, T>;
  export type ElementType<P = any> = React.ElementType<P>;
  export type ComponentType<P = {}> = React.ComponentType<P>;
  export type FC<P = {}> = React.FC<P>;
  export type PropsWithChildren<P = unknown> = React.PropsWithChildren<P>;
  export type ComponentProps<T extends ElementType> = React.ComponentProps<T>;
  
  // Add proper ReactPortal type
  export type ReactPortal = {
    children?: ReactNode;
    containerInfo: any;
    implementation: any;
    key: null | string;
  };
  
  // Add proper event handler types
  export type FormEvent<T = Element> = React.FormEvent<T>;
  export type ChangeEvent<T = Element> = React.ChangeEvent<T>;
  export type MouseEvent<T = Element> = React.MouseEvent<T>;
  
  // Add ref types
  export type RefObject<T> = React.RefObject<T>;
  export type MutableRefObject<T> = React.MutableRefObject<T>;
  export type Ref<T> = React.Ref<T>;
  export type ForwardedRef<T> = React.ForwardedRef<T>;

  // Add transition types
  export function startTransition(scope: () => void): void;
  export function useTransition(): [boolean, (callback: () => void) => void];

  // Add proper type declarations
  export type ReactNode = React.ReactNode;
  export type ElementType = React.ElementType;
  export type ComponentType = React.ComponentType;
  export type FC = React.FC;

  // Add missing function declarations
  export function createContext<T>(defaultValue: T): React.Context<T>;
  export function useContext<T>(context: React.Context<T>): T;
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T) => void];
  export function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<any>): void;
} 