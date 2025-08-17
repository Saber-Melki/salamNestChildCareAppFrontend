"use client"

import React from "react"
import { createPortal } from "react-dom"
import { cn } from "../../lib/utils"
import { AlertTriangle } from "lucide-react"

interface AlertDialogContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const AlertDialogContext = React.createContext<AlertDialogContextType | null>(null)

export function AlertDialog({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isOpen = open !== undefined ? open : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  return <AlertDialogContext.Provider value={{ open: isOpen, setOpen }}>{children}</AlertDialogContext.Provider>
}

export function AlertDialogTrigger({
  children,
  asChild = false,
}: {
  children: React.ReactNode
  asChild?: boolean
}) {
  const context = React.useContext(AlertDialogContext)
  if (!context) throw new Error("AlertDialogTrigger must be used within AlertDialog")

  const handleClick = () => context.setOpen(true)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      ...children.props,
    })
  }

  return <button onClick={handleClick}>{children}</button>
}

export function AlertDialogContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(AlertDialogContext)
  if (!context) throw new Error("AlertDialogContent must be used within AlertDialog")

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") context.setOpen(false)
    }

    if (context.open) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [context.open, context.setOpen])

  if (!context.open) return null

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => context.setOpen(false)} />
      <div
        className={cn(
          "relative w-full max-w-md",
          "bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

export function AlertDialogHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pb-2", className)} {...props}>
      {children}
    </div>
  )
}

export function AlertDialogTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-lg font-semibold flex items-center gap-2", className)} {...props}>
      <AlertTriangle className="h-5 w-5 text-amber-500" />
      {children}
    </h2>
  )
}

export function AlertDialogDescription({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-gray-600 mt-2", className)} {...props}>
      {children}
    </p>
  )
}

export function AlertDialogFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex justify-end gap-3 p-6 pt-4 border-t border-gray-200/50", className)} {...props}>
      {children}
    </div>
  )
}

export function AlertDialogCancel({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(AlertDialogContext)
  if (!context) throw new Error("AlertDialogCancel must be used within AlertDialog")

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    context.setOpen(false)
  }

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      {...props}
    >
      {children}
    </button>
  )
}

export function AlertDialogAction({
  children,
  onClick,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(AlertDialogContext)
  if (!context) throw new Error("AlertDialogAction must be used within AlertDialog")

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    context.setOpen(false)
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
