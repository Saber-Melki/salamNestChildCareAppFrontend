import type React from "react"
import { cn } from "../../lib/utils"

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "secondary" | "destructive" | "outline" }) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variant === "default" && "bg-neutral-200",
        variant === "secondary" && "bg-emerald-100 text-emerald-700",
        variant === "destructive" && "bg-rose-100 text-rose-700",
        variant === "outline" && "border border-neutral-300",
        className,
      )}
    />
  )
}
