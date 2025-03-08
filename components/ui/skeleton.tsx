import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const skeletonVariants = cva(
  "rounded-md animate-pulse",
  {
    variants: {
      variant: {
        default: "bg-primary/10",
        orange: "bg-orange-500/10",
        muted: "bg-muted",
      },
      shape: {
        default: "",
        text: "h-4 w-full",
        heading: "h-6 w-3/4",
        avatar: "rounded-full",
        button: "h-10",
        card: "h-[180px]",
        circle: "rounded-full",
      },
      size: {
        default: "",
        sm: "h-3 w-3",
        md: "h-6 w-6",
        lg: "h-10 w-10",
        xl: "h-14 w-14",
        full: "w-full",
      },
      animation: {
        pulse: "animate-pulse",
        shimmer: "animate-shimmer bg-gradient-to-r from-transparent via-primary/10 to-transparent bg-[length:400%_100%]",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "default",
      size: "default",
      animation: "pulse",
    },
    compoundVariants: [
      {
        shape: "avatar",
        size: "sm",
        className: "h-8 w-8",
      },
      {
        shape: "avatar",
        size: "md",
        className: "h-10 w-10",
      },
      {
        shape: "avatar",
        size: "lg",
        className: "h-12 w-12",
      },
      {
        shape: "avatar",
        size: "xl",
        className: "h-16 w-16",
      },
      {
        shape: "circle",
        size: "sm",
        className: "h-8 w-8",
      },
      {
        shape: "circle",
        size: "md",
        className: "h-10 w-10",
      },
      {
        shape: "circle",
        size: "lg",
        className: "h-12 w-12",
      },
      {
        shape: "circle",
        size: "xl",
        className: "h-16 w-16",
      },
    ],
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  count?: number;
  gap?: string;
}

function Skeleton({ 
  className, 
  variant, 
  shape, 
  size, 
  animation,
  count = 1,
  gap = "0.5rem",
  ...props 
}: SkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i)
  
  if (count > 1) {
    return (
      <div 
        className={cn("flex flex-col", className)} 
        style={{ gap }}
        role="status"
        aria-label="Loading"
        aria-live="polite"
        {...props}
      >
        {items.map((i) => (
          <div
            key={i}
            data-slot="skeleton"
            className={cn(skeletonVariants({ variant, shape, size, animation }))}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    )
  }
  
  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ variant, shape, size, animation }), className)}
      role="status"
      aria-label="Loading"
      aria-live="polite"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export { Skeleton }
