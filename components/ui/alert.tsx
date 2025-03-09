'use client';

import { type ComponentPropsWithoutRef } from 'react'
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "text-destructive-foreground border-destructive/50 bg-destructive/10 [&>svg]:text-destructive *:data-[slot=alert-description]:text-destructive-foreground/80",
        success:
          "text-green-800 border-green-500/50 bg-green-100 dark:text-green-400 dark:border-green-500/30 dark:bg-green-900/20 [&>svg]:text-green-500",
        warning:
          "text-yellow-800 border-yellow-500/50 bg-yellow-100 dark:text-yellow-400 dark:border-yellow-500/30 dark:bg-yellow-900/20 [&>svg]:text-yellow-500",
        info:
          "text-blue-800 border-blue-500/50 bg-blue-100 dark:text-blue-400 dark:border-blue-500/30 dark:bg-blue-900/20 [&>svg]:text-blue-500",
        orange:
          "text-orange-800 border-orange-500/50 bg-orange-100 dark:text-orange-400 dark:border-orange-500/30 dark:bg-orange-900/20 [&>svg]:text-orange-500",
      },
      size: {
        default: "px-4 py-3",
        sm: "px-3 py-2 text-xs",
        lg: "px-6 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export type AlertVariants = VariantProps<typeof alertVariants>

export interface AlertProps extends ComponentPropsWithoutRef<"div">, AlertVariants {
  onClose?: () => void;
}

export interface AlertTitleProps extends ComponentPropsWithoutRef<"div"> {}
export interface AlertDescriptionProps extends ComponentPropsWithoutRef<"div"> {}

export function Alert({
  className,
  variant,
  size,
  onClose,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant, size }), className)}
      {...props}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
      {children}
    </div>
  )
}
Alert.displayName = "Alert"

export function AlertTitle({
  className,
  ...props
}: AlertTitleProps) {
  return (
    <div
      className={cn("font-medium leading-none tracking-tight", className)}
      {...props}
    />
  )
}
AlertTitle.displayName = "AlertTitle"

export function AlertDescription({
  className,
  ...props
}: AlertDescriptionProps) {
  return (
    <div
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
}
AlertDescription.displayName = "AlertDescription"
