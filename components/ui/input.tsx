'use client';

import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        outline: "border-2",
        filled: "bg-muted/50 border-transparent hover:bg-muted/80 focus-visible:bg-transparent",
      },
      size: {
        default: "h-9 px-3 py-1",
        sm: "h-8 px-2 py-0.5 text-xs",
        lg: "h-10 px-4 py-2",
      },
      error: {
        true: "border-destructive focus-visible:ring-destructive",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
)

export type InputVariants = VariantProps<typeof inputVariants>

type BaseInputProps = Omit<ComponentPropsWithoutRef<"input">, "size" | "prefix" | "suffix">

export interface InputProps extends BaseInputProps, InputVariants {
  error?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

interface InputWrapperProps extends ComponentPropsWithoutRef<"div"> {
  disabled?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

function InputWrapper({
  children,
  className,
  disabled,
  prefix,
  suffix,
  ...props
}: InputWrapperProps) {
  return (
    <div 
      className={cn(
        "relative flex items-center",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {prefix && (
        <div className="absolute left-2 flex items-center pointer-events-none" aria-hidden="true">
          {prefix}
        </div>
      )}
      {children}
      {suffix && (
        <div className="absolute right-2 flex items-center pointer-events-none" aria-hidden="true">
          {suffix}
        </div>
      )}
    </div>
  );
}
InputWrapper.displayName = "InputWrapper";

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { 
    className, 
    type = "text", 
    variant, 
    size, 
    error, 
    rounded,
    prefix,
    suffix,
    disabled,
    ...props 
  }, 
  ref
) {
  return (
    <InputWrapper
      disabled={disabled}
      prefix={prefix}
      suffix={suffix}
    >
      <input
        type={type}
        className={cn(
          inputVariants({ variant, size, error, rounded }),
          prefix && "pl-8",
          suffix && "pr-8",
          className
        )}
        ref={ref}
        disabled={disabled}
        aria-invalid={error ? "true" : undefined}
        {...props}
      />
    </InputWrapper>
  );
});
Input.displayName = "Input";

export { Input, inputVariants }
