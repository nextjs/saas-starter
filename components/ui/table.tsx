"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Skeleton } from "./skeleton"

const tableVariants = cva(
  "w-full caption-bottom text-sm",
  {
    variants: {
      variant: {
        default: "",
        bordered: "[&_th]:border [&_td]:border",
        striped: "[&_tr:nth-child(even)]:bg-muted/50",
      },
      size: {
        default: "",
        sm: "text-xs [&_th]:p-1 [&_td]:p-1",
        lg: "text-base [&_th]:p-3 [&_td]:p-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface TableProps 
  extends React.ComponentProps<"table">,
    VariantProps<typeof tableVariants> {
  stickyHeader?: boolean;
  loading?: boolean;
  loadingRows?: number;
  loadingColumns?: number;
  hoverable?: boolean;
}

function Table({ 
  className, 
  variant, 
  size,
  stickyHeader = false,
  loading = false,
  loadingRows = 3,
  loadingColumns = 4,
  hoverable = true,
  children,
  ...props 
}: TableProps) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        "relative w-full overflow-x-auto",
        stickyHeader && "max-h-[70vh] overflow-y-auto"
      )}
    >
      <table
        data-slot="table"
        className={cn(tableVariants({ variant, size }), className)}
        {...props}
      >
        {loading ? (
          <>
            <thead>
              <tr>
                {Array.from({ length: loadingColumns }).map((_, i) => (
                  <th key={i} className="h-10 px-2">
                    <Skeleton className="h-4 w-full" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: loadingRows }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: loadingColumns }).map((_, j) => (
                    <td key={j} className="p-2">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </>
        ) : (
          children
        )}
      </table>
    </div>
  )
}

export interface TableHeaderProps 
  extends React.ComponentProps<"thead"> {
  sticky?: boolean;
}

function TableHeader({ 
  className, 
  sticky = false,
  ...props 
}: TableHeaderProps) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "[&_tr]:border-b", 
        sticky && "sticky top-0 z-10 bg-background",
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

export interface TableRowProps 
  extends React.ComponentProps<"tr"> {
  selected?: boolean;
  hoverable?: boolean;
}

function TableRow({ 
  className, 
  selected = false,
  hoverable = true,
  ...props 
}: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      data-state={selected ? "selected" : undefined}
      className={cn(
        "border-b transition-colors",
        hoverable && "hover:bg-muted/50",
        selected && "bg-muted",
        className
      )}
      {...props}
    />
  )
}

export interface TableHeadProps 
  extends React.ComponentProps<"th"> {
  sortable?: boolean;
  sorted?: "asc" | "desc" | null;
}

function TableHead({ 
  className, 
  sortable = false,
  sorted = null,
  children,
  ...props 
}: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-muted-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        sortable && "cursor-pointer select-none",
        className
      )}
      aria-sort={
        sorted === "asc"
          ? "ascending"
          : sorted === "desc"
          ? "descending"
          : sortable
          ? "none"
          : undefined
      }
      {...props}
    >
      {sortable ? (
        <div className="flex items-center gap-1">
          {children}
          {sorted && (
            <span className="ml-1">
              {sorted === "asc" ? "↑" : "↓"}
            </span>
          )}
        </div>
      ) : (
        children
      )}
    </th>
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
