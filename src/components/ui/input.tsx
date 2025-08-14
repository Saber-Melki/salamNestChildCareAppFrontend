import React from "react"
import { cn } from "../../lib/utils"

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      {...props}
      className={cn(
        "flex h-9 w-full rounded-md border border-neutral-300 bg-white px-3 py-1 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40",
        className,
      )}
    />
  ),
)
Input.displayName = "Input"
