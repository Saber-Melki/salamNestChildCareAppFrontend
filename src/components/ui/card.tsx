import type React from "react"
import { cn } from "../../lib/utils"

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-xl border bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 shadow-sm",
        className,
      )}
    />
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("p-4", className)} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 {...props} className={cn("text-base font-semibold", className)} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("p-4 pt-0", className)} />
}
