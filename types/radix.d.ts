import * as React from 'react';

declare module '@radix-ui/react-dialog' {
  interface DialogProps {
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

  export const Root: React.FC<DialogProps>;
  export const Trigger: React.ForwardRefExoticComponent<DialogTriggerProps>;
  export const Portal: React.FC<DialogPortalProps>;
  export const Overlay: React.ForwardRefExoticComponent<DialogOverlayProps>;
  export const Content: React.ForwardRefExoticComponent<DialogContentProps>;
  export const Title: React.ForwardRefExoticComponent<DialogTitleProps>;
  export const Description: React.ForwardRefExoticComponent<DialogDescriptionProps>;
  export const Close: React.ForwardRefExoticComponent<DialogCloseProps>;
} 