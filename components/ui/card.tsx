'use client';

import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-xl text-card-foreground",
  {
    variants: {
      variant: {
        default: "bg-card border shadow",
        bordered: "bg-transparent border",
        elevated: "bg-card border shadow-md hover:shadow-lg transition-shadow duration-200",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export type CardVariants = VariantProps<typeof cardVariants>

export interface CardProps extends ComponentPropsWithoutRef<"div">, CardVariants {
  asChild?: boolean;
}

export interface CardHeaderProps extends ComponentPropsWithoutRef<"div"> {}
export interface CardTitleProps extends ComponentPropsWithoutRef<"h3"> {}
export interface CardDescriptionProps extends ComponentPropsWithoutRef<"p"> {}
export interface CardContentProps extends ComponentPropsWithoutRef<"div"> {}
export interface CardFooterProps extends ComponentPropsWithoutRef<"div"> {}

const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant, size, ...props }, 
  ref
) {
  return (
    <div
      ref={ref}
      role="region"
      className={cn(cardVariants({ variant, size }), className)}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { className, ...props }, 
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
});
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { className, ...props }, 
  ref
) {
  return (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
});
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(function CardDescription(
  { className, ...props }, 
  ref
) {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(function CardContent(
  { className, ...props }, 
  ref
) {
  return (
    <div 
      ref={ref} 
      className={cn("p-6 pt-0", className)} 
      {...props} 
    />
  );
});
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
  { className, ...props }, 
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-between p-6 pt-0", className)}
      {...props}
    />
  );
});
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
