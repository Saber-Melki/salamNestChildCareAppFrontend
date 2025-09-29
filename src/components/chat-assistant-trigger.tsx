"use client"

import React from "react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Bot, Sparkles } from "lucide-react"
import { cn } from "../lib/utils"

interface ChatAssistantTriggerProps {
  onClick: () => void
  hasUnreadMessages?: boolean
  className?: string
}

export function ChatAssistantTrigger({ onClick, hasUnreadMessages = false, className }: ChatAssistantTriggerProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <Button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed bottom-4 right-4 z-40 h-16 w-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 hover:from-purple-600 hover:via-pink-600 hover:to-fuchsia-600 group border-0",
        isHovered && "w-auto px-6",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Bot className="w-7 h-7 text-white drop-shadow-lg" />
          <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse drop-shadow-sm" />
          {hasUnreadMessages && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-red-500 text-white text-xs border-2 border-white shadow-lg">
              !
            </Badge>
          )}
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300 whitespace-nowrap",
            isHovered ? "max-w-xs opacity-100" : "max-w-0 opacity-0",
          )}
        >
          <span className="text-white font-bold text-base drop-shadow-sm">Ask Chat Assistant</span>
        </div>
      </div>

      {/* Pulse animation ring */}
      <div className="absolute inset-0 rounded-full bg-purple-400/30 animate-ping opacity-75" />

      {/* Floating particles effect */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-bounce opacity-70" />
        <div className="absolute top-4 right-3 w-1 h-1 bg-blue-300 rounded-full animate-pulse opacity-50" />
        <div className="absolute bottom-3 left-4 w-1 h-1 bg-green-300 rounded-full animate-ping opacity-60" />
      </div>
    </Button>
  )
}
