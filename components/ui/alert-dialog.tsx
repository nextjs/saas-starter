"use client"

import * as React from "react"
import { type ComponentPropsWithoutRef, forwardRef } from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const alertDialogVariants = cva(
  "bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  {
    variants: {
      size: {
        default: "sm:max-w-lg",
        sm: "sm:max-w-sm",
        lg: "sm:max-w-xl",
        xl: "sm:max-w-2xl",
        full: "sm:max-w-full",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

interface AlertDialogProps extends ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root> {}

/**
 * Root component for the Alert Dialog.
 * Manages the open state and accessibility features of the dialog.
 */
const AlertDialog = forwardRef<
  HTMLDivElement,
  AlertDialogProps
>(({ ...props }, ref) => (
  <AlertDialogPrimitive.Root ref={ref} data-slot="alert-dialog" {...props} />
))
AlertDialog.displayName = "AlertDialog"

interface AlertDialogTriggerProps extends ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Trigger> {}

/**
 * Trigger component for the Alert Dialog.
 * The button that opens the dialog when clicked.
 */
const AlertDialogTrigger = forwardRef<
  HTMLButtonElement,
  AlertDialogTriggerProps
>(({ ...props }, ref) => (
  <AlertDialogPrimitive.Trigger
    ref={ref}
    data-slot="alert-dialog-trigger"
    {...props}
  />
))
AlertDialogTrigger.displayName = "AlertDialogTrigger"

interface AlertDialogPortalProps extends ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Portal> {}

/**
 * Portal component for the Alert Dialog.
 * Renders the dialog content in a portal outside the main DOM hierarchy.
 */
const AlertDialogPortal = forwardRef<
  HTMLDivElement,
  AlertDialogPortalProps
>(({ ...props }, ref) => (
  <AlertDialogPrimitive.Portal
    ref={ref}
    data-slot="alert-dialog-portal"
    {...props}
  />
))
AlertDialogPortal.displayName = "AlertDialogPortal"

interface AlertDialogOverlayProps extends ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay> {}

/**
 * Overlay component for the Alert Dialog.
 * Provides the semi-transparent background behind the dialog.
 */
const AlertDialogOverlay = forwardRef<
  HTMLDivElement,
  AlertDialogOverlayProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    data-slot="alert-dialog-overlay"
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
AlertDialogOverlay.displayName = "AlertDialogOverlay"

interface AlertDialogContentProps
  extends ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>,
    VariantProps<typeof alertDialogVariants> {}

/**
 * Content component for the Alert Dialog.
 * Contains the main content of the dialog.
 */
const AlertDialogContent = forwardRef<
  HTMLDivElement,
  AlertDialogContentProps
>(({ className, size, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      data-slot="alert-dialog-content"
      className={cn(alertDialogVariants({ size }), className)}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = "AlertDialogContent"

interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Header component for the Alert Dialog.
 * Contains the title and description of the dialog.
 */
const AlertDialogHeader = forwardRef<HTMLDivElement, AlertDialogHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
)
AlertDialogHeader.displayName = "AlertDialogHeader"

interface AlertDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Footer component for the Alert Dialog.
 * Contains the action buttons of the dialog.
 */
const AlertDialogFooter = forwardRef<HTMLDivElement, AlertDialogFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
)
AlertDialogFooter.displayName = "AlertDialogFooter"

interface AlertDialogTitleProps extends ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title> {}

/**
 * Title component for the Alert Dialog.
 * The main heading of the dialog.
 */
const AlertDialogTitle = forwardRef<
  HTMLHeadingElement,
  AlertDialogTitleProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    data-slot="alert-dialog-title"
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = "AlertDialogTitle"

interface AlertDialogDescriptionProps extends ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description> {}

/**
 * Description component for the Alert Dialog.
 * The explanatory text of the dialog.
 */
const AlertDialogDescription = forwardRef<
  HTMLParagraphElement,
  AlertDialogDescriptionProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    data-slot="alert-dialog-description"
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
))
AlertDialogDescription.displayName = "AlertDialogDescription"

interface AlertDialogActionProps extends ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action> {}

/**
 * Action component for the Alert Dialog.
 * The primary action button (e.g., Confirm, Delete).
 */
const AlertDialogAction = forwardRef<
  HTMLButtonElement,
  AlertDialogActionProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants({ variant: "orange" }), className)}
    {...props}
  />
))
AlertDialogAction.displayName = "AlertDialogAction"

interface AlertDialogCancelProps extends ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel> {}

/**
 * Cancel component for the Alert Dialog.
 * The secondary action button (e.g., Cancel, Close).
 */
const AlertDialogCancel = forwardRef<
  HTMLButtonElement,
  AlertDialogCancelProps
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), className)}
    {...props}
  />
))
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
