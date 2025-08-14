import React from "react"
import { cn } from "../../lib/utils"

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      {...props}
      className={cn(
        "w-full min-h-[100px] rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40",
        className,
      )}
    />
  ),
)
Textarea.displayName = "Textarea"
