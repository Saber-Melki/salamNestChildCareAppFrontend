"use client"
import { useAsyncTranslation } from "../hooks/useAsyncTranslation"
import { Loader2 } from "lucide-react"
import { cn } from "../lib/utils"

interface AsyncTextProps {
  children: string
  showLoader?: boolean
  className?: string
  fallback?: string
}

export function AsyncText({ children, showLoader = false, className, fallback }: AsyncTextProps) {
  const { translatedText, isLoading } = useAsyncTranslation(children)

  if (isLoading && showLoader) {
    return (
      <span className={cn("inline-flex items-center gap-1", className)}>
        <Loader2 className="h-3 w-3 animate-spin" />
        {fallback || children}
      </span>
    )
  }

  return <span className={className}>{translatedText}</span>
}
