"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const tooltipVariants = cva(
  "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        orange: "bg-orange-500 text-white",
        muted: "bg-muted text-muted-foreground",
      },
      size: {
        default: "px-3 py-1.5 text-xs",
        sm: "px-2 py-1 text-[10px]",
        lg: "px-4 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface TooltipProviderProps extends React.ComponentProps<typeof TooltipPrimitive.Provider> {
  delayDuration?: number;
}

function TooltipProvider({
  delayDuration = 300,
  ...props
}: TooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

export interface TooltipProps extends React.ComponentProps<typeof TooltipPrimitive.Root> {
  delayDuration?: number;
}

function Tooltip({
  delayDuration,
  ...props
}: TooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

export interface TooltipContentProps 
  extends React.ComponentProps<typeof TooltipPrimitive.Content>,
    VariantProps<typeof tooltipVariants> {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
  maxWidth?: number | string;
  showArrow?: boolean;
}

function TooltipContent({
  className,
  variant,
  size,
  side = "top",
  align = "center",
  sideOffset = 4,
  alignOffset = 0,
  maxWidth = 250,
  showArrow = true,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className={cn(
          tooltipVariants({ variant, size }),
          className
        )}
        style={{ 
          ...props.style,
          maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth
        }}
        {...props}
      >
        {children}
        {showArrow && (
          <TooltipPrimitive.Arrow 
            className={cn(
              "fill-current z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]",
              variant === "default" && "bg-primary fill-primary",
              variant === "orange" && "bg-orange-500 fill-orange-500",
              variant === "muted" && "bg-muted fill-muted"
            )} 
          />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
