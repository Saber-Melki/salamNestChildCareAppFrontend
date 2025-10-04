"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "error" | "warning"
  duration?: number
  onClose: (id: string) => void
}

export function Toast({ id, title, description, variant = "default", duration = 5000, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden",
        "animate-in slide-in-from-top-full duration-300",
        {
          "bg-white": variant === "default",
          "bg-green-50 ring-green-200": variant === "success",
          "bg-red-50 ring-red-200": variant === "error",
          "bg-yellow-50 ring-yellow-200": variant === "warning",
        },
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-1">
            {title && (
              <p
                className={cn("text-sm font-semibold", {
                  "text-gray-900": variant === "default",
                  "text-green-800": variant === "success",
                  "text-red-800": variant === "error",
                  "text-yellow-800": variant === "warning",
                })}
              >
                {title}
              </p>
            )}
            {description && (
              <p
                className={cn("mt-1 text-sm", {
                  "text-gray-600": variant === "default",
                  "text-green-700": variant === "success",
                  "text-red-700": variant === "error",
                  "text-yellow-700": variant === "warning",
                })}
              >
                {description}
              </p>
            )}
          </div>
          <button
            onClick={() => onClose(id)}
            className={cn("ml-4 inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2", {
              "text-gray-400 hover:text-gray-500": variant === "default",
              "text-green-500 hover:text-green-600": variant === "success",
              "text-red-500 hover:text-red-600": variant === "error",
              "text-yellow-500 hover:text-yellow-600": variant === "warning",
            })}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function ToastContainer({ children }: { children: React.ReactNode }) {
  return <div className="pointer-events-none fixed top-0 right-0 z-50 flex flex-col gap-2 p-4 sm:p-6">{children}</div>
}
