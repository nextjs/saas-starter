"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "h-1",
        default: "h-2",
        lg: "h-3",
        xl: "h-4",
      },
      variant: {
        default: "bg-primary/20",
        orange: "bg-orange-200 dark:bg-orange-900/20",
        success: "bg-green-200 dark:bg-green-900/20",
        info: "bg-blue-200 dark:bg-blue-900/20",
        warning: "bg-yellow-200 dark:bg-yellow-900/20",
        destructive: "bg-destructive/20",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

const indicatorVariants = cva(
  "h-full w-full flex-1 transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary",
        orange: "bg-orange-500",
        success: "bg-green-500",
        info: "bg-blue-500",
        warning: "bg-yellow-500",
        destructive: "bg-destructive",
      },
      indeterminate: {
        true: "animate-indeterminate-progress",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ProgressProps
  extends React.ComponentProps<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  indicatorVariant?: VariantProps<typeof indicatorVariants>["variant"];
  indeterminate?: boolean;
  showValueLabel?: boolean;
  label?: string;
}

function Progress({
  className,
  value,
  size,
  variant,
  indicatorVariant,
  indeterminate = false,
  showValueLabel = false,
  label,
  ...props
}: ProgressProps) {
  const [progressValue, setProgressValue] = React.useState(0)
  
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setProgressValue(value || 0)
    }, 100)
    
    return () => clearTimeout(timeout)
  }, [value])

  return (
    <div className="w-full">
      {(label || showValueLabel) && (
        <div className="flex justify-between text-sm mb-1">
          {label && <span>{label}</span>}
          {showValueLabel && <span>{progressValue}%</span>}
        </div>
      )}
      <ProgressPrimitive.Root
        data-slot="progress"
        className={cn(
          progressVariants({ size, variant }),
          className
        )}
        value={value}
        aria-label={label || "Progress"}
        aria-valuetext={`${progressValue}%`}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn(
            indicatorVariants({ 
              variant: indicatorVariant || variant, 
              indeterminate 
            })
          )}
          style={{ 
            transform: indeterminate 
              ? undefined 
              : `translateX(-${100 - progressValue}%)` 
          }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
}

export { Progress }
