"use client"

import React from "react"
import { cn } from "../../lib/utils"

type TabsCtx = { value: string; setValue: (v: string) => void }
const Ctx = React.createContext<TabsCtx | null>(null)

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
}: {
  defaultValue?: string
  value?: string
  onValueChange?: (v: string) => void
  className?: string
  children: React.ReactNode
}) {
  const [internal, setInternal] = React.useState(defaultValue || "")
  const v = value ?? internal
  const set = (nv: string) => {
    setInternal(nv)
    onValueChange?.(nv)
  }
  return (
    <Ctx.Provider value={{ value: v, setValue: set }}>
      <div className={className}>{children}</div>
    </Ctx.Provider>
  )
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("inline-flex rounded-md border p-1 gap-1", className)} />
}

export function TabsTrigger({
  value,
  children,
}: {
  value: string
  children: React.ReactNode
}) {
  const ctx = React.useContext(Ctx)!
  const active = ctx.value === value
  return (
    <button
      onClick={() => ctx.setValue(value)}
      className={cn("px-3 py-1.5 text-sm rounded-md", active ? "bg-foreground text-white" : "hover:bg-neutral-100")}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string
  className?: string
  children: React.ReactNode
}) {
  const ctx = React.useContext(Ctx)!
  if (ctx.value !== value) return null
  return <div className={className}>{children}</div>
}
