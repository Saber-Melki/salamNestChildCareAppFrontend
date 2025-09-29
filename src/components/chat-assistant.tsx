"use client"

import React from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Dialog } from "./ui/dialog"
import { useRBAC } from "../contexts/rbac"
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  RefreshCw,
  Settings,
  X,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Clock,
  User,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  MessageCircle,
} from "lucide-react"
import { cn } from "../lib/utils"
import { ChatResponse, chatService } from "../services/chat-service"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  confidence?: number
  sources?: string[]
  suggestions?: string[]
  isLoading?: boolean
}

interface ChatAssistantProps {
  isOpen: boolean
  onToggle: () => void
  className?: string
}

export function ChatAssistant({ isOpen, onToggle, className }: ChatAssistantProps) {
  const { user } = useRBAC()
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedProvider, setSelectedProvider] = React.useState<"openrouter" | "gemini">("openrouter")
  const [isMinimized, setIsMinimized] = React.useState(false)
  const [showSettings, setShowSettings] = React.useState(false)
  const [autoSpeak, setAutoSpeak] = React.useState(false)

  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])

  // Initialize with welcome message
  React.useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Hello ${user?.name || "there"}! 👋 I'm your intelligent chat assistant for the childcare management system. 

I can help you with:
• Finding information about children and families
• Analyzing attendance patterns and trends  
• Generating reports and insights
• Managing staff schedules and assignments
• Tracking billing and payments
• Health and safety compliance
• Answering questions about childcare services
• And much more!

What would you like to know about your childcare center today?`,
        timestamp: new Date(),
        confidence: 1.0,
        suggestions: [
          "Show me today's attendance summary",
          "Which children have outstanding health forms?",
          "What's our revenue for this month?",
          "Who are the new enrollments this week?",
          "Show me staff schedule conflicts",
          "What childcare services do we offer?",
        ],
      }
      setMessages([welcomeMessage])
    }
  }, [user?.name])

  const speakText = (text: string) => {
    if (autoSpeak && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    const loadingMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Analyzing your request and searching through our childcare database...",
      timestamp: new Date(),
      isLoading: true,
    }

    setMessages((prev) => [...prev, userMessage, loadingMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      let response: ChatResponse

      if (selectedProvider === "openrouter") {
        response = await chatService.queryWithOpenRouter(userMessage.content, user?.id || "anonymous")
      } else {
        response = await chatService.queryWithGemini(userMessage.content, user?.id || "anonymous")
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.answer,
        timestamp: response.timestamp,
        confidence: response.confidence,
        sources: response.sources,
        suggestions: response.suggestions,
      }

      setMessages((prev) => prev.slice(0, -1).concat(assistantMessage))
      speakText(response.answer)
    } catch (error) {
      console.error("Chat Assistant error:", error)

      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "I apologize, but I encountered an error while processing your request. This might be due to API connectivity issues. Please try again or contact support if the issue persists.",
        timestamp: new Date(),
        confidence: 0,
      }

      setMessages((prev) => prev.slice(0, -1).concat(errorMessage))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    setTimeout(() => handleSendMessage(), 100)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const clearConversation = () => {
    setMessages([])
    chatService.clearHistory(user?.id || "anonymous")
    // Re-add welcome message
    const welcomeMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `Hello ${user?.name || "there"}! I'm your chat assistant for the childcare management system. How can I help you today?`,
      timestamp: new Date(),
      confidence: 1.0,
      suggestions: [
        "Show me today's attendance summary",
        "Which children have outstanding health forms?",
        "What's our revenue for this month?",
        "Who are the new enrollments this week?",
      ],
    }
    setMessages([welcomeMessage])
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (!isOpen) return null

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur-xl border-2 border-purple-200/50 rounded-2xl shadow-2xl transition-all duration-300",
        isMinimized ? "w-80 h-16" : "w-96 h-[600px]",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-800">Chat Assistant</h3>
            <p className="text-xs text-gray-600">
              Powered by {selectedProvider === "openrouter" ? "OpenRouter" : "Gemini"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)} className="h-8 w-8 p-0">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)} className="h-8 w-8 p-0">
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggle} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[400px] bg-gradient-to-b from-white to-purple-50/30">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    {message.isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                )}

                <div className={cn("max-w-[80%] space-y-2", message.role === "user" && "items-end")}>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm shadow-lg",
                      message.role === "user"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-auto"
                        : "bg-white border border-purple-100",
                      message.isLoading && "animate-pulse",
                    )}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>

                    {/* Message metadata */}
                    {!message.isLoading && (
                      <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(message.timestamp)}</span>

                        {message.confidence !== undefined && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            {Math.round(message.confidence * 100)}%
                          </Badge>
                        )}

                        {message.role === "assistant" && (
                          <div className="flex gap-1 ml-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(message.content)}
                              className="h-5 w-5 p-0 hover:bg-purple-100"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-green-100">
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-red-100">
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {message.sources.map((source, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          📊 {source}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600 font-medium">💡 Suggested follow-up questions:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs h-auto py-2 px-3 justify-start text-left bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200"
                            disabled={isLoading}
                          >
                            <MessageCircle className="w-3 h-3 mr-2 flex-shrink-0" />
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-gradient-to-r from-white to-purple-50/30">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Ask me anything about childcare services, attendance, billing..."
                disabled={isLoading}
                className="flex-1 border-2 border-purple-200 focus:border-purple-400 bg-white/90 backdrop-blur-sm"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="sm"
                className="px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={clearConversation}
                className="text-xs bg-white/80 hover:bg-purple-50 border-purple-200"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Clear Chat
              </Button>
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                {messages.filter((m) => m.role === "user").length} questions asked
              </Badge>
            </div>
          </div>
        </>
      )}

      {/* Settings Dialog */}
      {showSettings && (
        <Dialog open={showSettings}>
          <div className="space-y-6 p-6 bg-gradient-to-br from-white to-purple-50 rounded-2xl">
            <h3 className="text-xl font-bold text-gray-800">Chat Assistant Settings</h3>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">AI Provider</label>
                <div className="flex gap-3">
                  <Button
                    variant={selectedProvider === "openrouter" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedProvider("openrouter")}
                    className={
                      selectedProvider === "openrouter"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "border-purple-200 hover:bg-purple-50"
                    }
                  >
                    OpenRouter
                  </Button>
                  <Button
                    variant={selectedProvider === "gemini" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedProvider("gemini")}
                    className={
                      selectedProvider === "gemini"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "border-purple-200 hover:bg-purple-50"
                    }
                  >
                    Gemini
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">Auto-speak responses</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  className="h-10 w-10 p-0 border-purple-200 hover:bg-purple-50"
                >
                  {autoSpeak ? (
                    <Volume2 className="w-4 h-4 text-purple-600" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-gray-500" />
                  )}
                </Button>
              </div>

              <div className="text-xs text-gray-600 space-y-2 bg-gray-50 p-4 rounded-xl">
                <p>
                  <strong>OpenRouter:</strong> More accurate, better for complex queries about childcare data
                </p>
                <p>
                  <strong>Gemini:</strong> Faster responses, good for simple questions and general assistance
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
                className="border-purple-200 hover:bg-purple-50"
              >
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
