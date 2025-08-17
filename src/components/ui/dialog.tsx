"use client"

import React from "react"
import { createPortal } from "react-dom"
import { cn } from "../../lib/utils"
import { X } from "lucide-react"

interface DialogContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextType | null>(null)

export function Dialog({
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

  return <DialogContext.Provider value={{ open: isOpen, setOpen }}>{children}</DialogContext.Provider>
}

export function DialogTrigger({
  children,
  asChild = false,
}: {
  children: React.ReactNode
  asChild?: boolean
}) {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error("DialogTrigger must be used within Dialog")

  const handleClick = () => context.setOpen(true)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      ...children.props,
    })
  }

  return <button onClick={handleClick}>{children}</button>
}

export function DialogContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error("DialogContent must be used within Dialog")

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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => context.setOpen(false)} />

      {/* Dialog */}
      <div
        className={cn(
          "relative w-full max-w-lg max-h-[90vh] overflow-auto",
          "bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          className,
        )}
        {...props}
      >
        <button
          onClick={() => context.setOpen(false)}
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-black/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

export function DialogHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pb-2", className)} {...props}>
      {children}
    </div>
  )
}

export function DialogTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-xl font-semibold", className)} {...props}>
      {children}
    </h2>
  )
}

export function DialogDescription({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-gray-600 mt-2", className)} {...props}>
      {children}
    </p>
  )
}

export function DialogBody({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-4", className)} {...props}>
      {children}
    </div>
  )
}

export function DialogFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex justify-end gap-3 p-6 pt-2 border-t border-gray-200/50", className)} {...props}>
      {children}
    </div>
  )
}