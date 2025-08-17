"use client"

import React from "react"
import { cn } from "../../lib/utils"
import { ChevronDown } from "lucide-react"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  children: React.ReactNode
  className?: string
}

interface SelectContextType {
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType | null>(null)

export function Select({ value, onValueChange, children, className }: SelectProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className={cn("relative", className)}>{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({
  children,
  className,
  placeholder,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { placeholder?: string }) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectTrigger must be used within Select")

  return (
    <button
      type="button"
      onClick={() => context.setOpen(!context.open)}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-neutral-300 bg-white px-3 py-1 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500/40",
        className,
      )}
      {...props}
    >
      <span className={cn(!context.value && "text-neutral-400")}>{context.value || placeholder || "Select..."}</span>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

export function SelectContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectContent must be used within Select")

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest("[data-select-content]")) {
        context.setOpen(false)
      }
    }

    if (context.open) {
      document.addEventListener("click", handleClickOutside)
    }

    return () => document.removeEventListener("click", handleClickOutside)
  }, [context.open, context.setOpen])

  if (!context.open) return null

  return (
    <div
      data-select-content
      className={cn(
        "absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto",
        "rounded-md border bg-white shadow-lg",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SelectItem({
  children,
  value,
  className,
}: {
  children: React.ReactNode
  value: string
  className?: string
}) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectItem must be used within Select")

  const handleClick = () => {
    context.onValueChange?.(value)
    context.setOpen(false)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "w-full px-3 py-2 text-left text-sm hover:bg-neutral-100",
        context.value === value && "bg-neutral-100",
        className,
      )}
    >
      {children}
    </button>
  )
}