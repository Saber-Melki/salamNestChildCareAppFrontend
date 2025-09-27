"use client"

import React from "react"

import { AsyncText } from "./async-text"
import { Badge, Bot, Sparkles } from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"

interface AIAssistantTriggerProps {
  onClick: () => void
  hasUnreadMessages?: boolean
  className?: string
}

export function AIAssistantTrigger({ onClick, hasUnreadMessages = false, className }: AIAssistantTriggerProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <Button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed bottom-4 right-4 z-40 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary group",
        isHovered && "w-auto px-4",
        className,
      )}
    >
      <div className={cn("flex items-center gap-2")}>
        <div className="relative">
          <Bot className="w-6 h-6 text-primary-foreground" />
          <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
          {hasUnreadMessages && <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 bg-red-500 text-xs">!</Badge>}
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300 whitespace-nowrap",
            isHovered ? "max-w-xs opacity-100" : "max-w-0 opacity-0",
          )}
        >
          <span className="text-primary-foreground font-medium text-sm">
            <AsyncText>Ask AI Assistant</AsyncText>
          </span>
        </div>
      </div>

      {/* Pulse animation */}
      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75" />

      {/* Floating particles effect */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="absolute top-1 left-1 w-1 h-1 bg-yellow-300 rounded-full animate-bounce opacity-60" />
        <div className="absolute top-3 right-2 w-0.5 h-0.5 bg-blue-300 rounded-full animate-pulse opacity-40" />
        <div className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-green-300 rounded-full animate-ping opacity-50" />
      </div>
    </Button>
  )
}
