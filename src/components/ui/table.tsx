import type React from "react"
import { cn } from "../../lib/utils"

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return <table {...props} className={cn("w-full text-sm", className)} />
}
export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} className={cn("bg-neutral-50", className)} />
}
export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} className={cn("border-b last:border-0", className)} />
}
export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th {...props} className={cn("px-3 py-2 text-left font-medium text-neutral-600", className)} />
}
export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} className={cn("", className)} />
}
export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} className={cn("px-3 py-2 align-middle", className)} />
}
