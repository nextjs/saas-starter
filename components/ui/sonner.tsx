"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps, toast as sonnerToast, type ToastClassnames } from "sonner"
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

export type ToastTypes = "success" | "error" | "info" | "warning" | "orange" | "default"

interface ToastProps {
  title?: string
  description?: string
  type?: ToastTypes
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  cancel?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
}

const icons = {
  success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  error: <AlertCircle className="h-5 w-5 text-destructive" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
  orange: <CheckCircle2 className="h-5 w-5 text-orange-500" />,
}

export function toast({
  title,
  description,
  type = "default",
  duration,
  action,
  cancel,
  icon,
  ...props
}: ToastProps) {
  return sonnerToast(
    title && (
      <div className="grid gap-1">
        {title && <p className="font-semibold">{title}</p>}
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
    ),
    {
      duration,
      icon: icon || (type !== "default" ? icons[type as Exclude<ToastTypes, "default">] : undefined),
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
      cancel: cancel
        ? {
            label: cancel.label,
            onClick: cancel.onClick,
          }
        : undefined,
      className: cn({
        "sonner-toast-success": type === "success",
        "sonner-toast-error": type === "error",
        "sonner-toast-warning": type === "warning",
        "sonner-toast-info": type === "info",
        "sonner-toast-orange": type === "orange",
      }),
      ...props,
    }
  )
}

export interface CustomToasterProps extends ToasterProps {
  closeButton?: boolean
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center"
}

// Extend the ToastClassnames type to include our custom orange class
interface ExtendedToastClassnames extends ToastClassnames {
  orange?: string
}

const Toaster = ({ 
  closeButton = true,
  position = "top-right",
  ...props 
}: CustomToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position={position}
      closeButton={closeButton}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium",
          success:
            "group-[.toast]:border-green-500/30 group-[.sonner-toast-success]:bg-green-500/10",
          error:
            "group-[.toast]:border-destructive/30 group-[.sonner-toast-error]:bg-destructive/10",
          warning:
            "group-[.toast]:border-yellow-500/30 group-[.sonner-toast-warning]:bg-yellow-500/10",
          info:
            "group-[.toast]:border-blue-500/30 group-[.sonner-toast-info]:bg-blue-500/10",
          orange:
            "group-[.toast]:border-orange-500/30 group-[.sonner-toast-orange]:bg-orange-500/10",
        } as ExtendedToastClassnames,
      }}
      {...props}
    />
  )
}

export { Toaster }
