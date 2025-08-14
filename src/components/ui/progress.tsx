import { cn } from "../../lib/utils"

export function Progress({ value = 0, className }: { value?: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full rounded-full bg-neutral-200", className)}>
      <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}
