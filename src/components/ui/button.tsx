import type React from "react"
import { cn } from "../../lib/utils"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "icon"
}

export function Button({ className, variant = "default", size = "default", ...props }: Props) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50 disabled:pointer-events-none",
        variant === "default" && "bg-foreground text-white hover:opacity-90",
        variant === "secondary" && "bg-neutral-200 hover:bg-neutral-300 text-foreground",
        variant === "outline" && "border border-neutral-300 hover:bg-neutral-100",
        variant === "ghost" && "hover:bg-neutral-100",
        size === "default" && "h-9 px-3",
        size === "sm" && "h-8 px-2.5",
        size === "icon" && "h-10 w-10",
        className,
      )}
    />
  )
}
