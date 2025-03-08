import * as React from "react"
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

export interface AlertProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof alertVariants> {
  onClose?: () => void;
}

function Alert({
  className,
  variant,
  size,
  onClose,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      data-slot="alert"
      role="alert"
      aria-live={variant === "destructive" ? "assertive" : "polite"}
      className={cn(alertVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-background/80 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Close alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
