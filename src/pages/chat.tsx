"use client"

import React from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { useRBAC } from "../contexts/rbac"
import { enhancedChatService } from "../services/enhanced-chat-service"
import { pdfReportService } from "../services/pdf-report-service"
import { useBranding } from "../contexts/branding"
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Clock,
  User,
  Volume2,
  VolumeX,
  Zap,
  Database,
  Brain,
  MessageCircle,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  Heart,
  DollarSign,
  Download,
  FileDown,
  Sparkle,
} from "lucide-react"
import { cn } from "../lib/utils"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  confidence?: number
  sources?: string[]
  suggestions?: string[]
  isLoading?: boolean
  reportData?: any
}

const TypingIndicator = () => (
  <div className="flex items-center space-x-1.5 p-2">
    <span className="h-2 w-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
    <span className="h-2 w-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
    <span className="h-2 w-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce"></span>
  </div>
)

export default function ChatPage() {
  const { user } = useRBAC()
  const { name: brandName } = useBranding()
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [autoSpeak, setAutoSpeak] = React.useState(false)

  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  React.useEffect(() => {
    if (!isLoading) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isLoading])

  React.useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Hello ${user?.name || "there"}! 👋 I'm **Sparky**, your intelligent AI assistant for ${brandName}. 

I have access to all your childcare center's data and can help you with:

✨ **Generate comprehensive reports** (with beautiful PDF downloads!)
📊 **Analyze attendance, billing, and health data**
👥 **Manage staff schedules and children information**
🎯 **Answer questions about your operations**

I also remember our conversation, so feel free to ask follow-up questions!

How can I help you manage your center today?`,
        timestamp: new Date(),
        confidence: 1.0,
        suggestions: [
          "Generate a comprehensive daily report",
          "Show me today's attendance summary",
          "What's our revenue for this month?",
          "Who are the new enrollments this week?",
        ],
      }
      setMessages([welcomeMessage])
    }
  }, [user?.name, brandName])

  const speakText = (text: string) => {
    if (autoSpeak && "speechSynthesis" in window) {
      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      utterance.pitch = 1.1
      speechSynthesis.speak(utterance)
    }
  }

  const streamResponse = (response: any) => {
    const words = response.answer.split(/(\s+)/)
    let streamedContent = ""

    setMessages((prev) => {
      const newMessages = [...prev]
      const lastMessage = newMessages[newMessages.length - 1]
      if (lastMessage && lastMessage.role === "assistant") {
        lastMessage.isLoading = false
      }
      return newMessages
    })

    words.forEach((word: string, index: number) => {
      setTimeout(() => {
        streamedContent += word
        setMessages((prev) => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage && lastMessage.role === "assistant") {
            lastMessage.content = streamedContent
          }
          return newMessages
        })

        if (index === words.length - 1) {
          speakText(response.answer)
        }
      }, index * 30)
    })
  }

  const handleSendMessage = async () => {
    const trimmedInput = inputValue.trim()
    if (!trimmedInput || isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedInput,
      timestamp: new Date(),
    }

    const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }))

    const loadingMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    }

    setMessages((prev) => [...prev, userMessage, loadingMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await enhancedChatService.query(userMessage.content, user?.id || "anonymous", history)

      setMessages((prev) => {
        const newMessages = [...prev]
        const lastMessage = newMessages[newMessages.length - 1]
        if (lastMessage) {
          lastMessage.confidence = response.confidence
          lastMessage.sources = response.sources
          lastMessage.suggestions = response.suggestions
          lastMessage.timestamp = response.timestamp
          lastMessage.reportData = response.reportData
        }
        return newMessages
      })

      streamResponse(response)
    } catch (error) {
      console.error("Chat Assistant error:", error)
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I apologize, but I've encountered an error. Please check the server connection and try again.",
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
    setTimeout(() => {
      const sendButton = document.getElementById("send-button")
      if (sendButton) {
        sendButton.click()
      } else {
        handleSendMessage()
      }
    }, 100)
  }

  const handleDownloadPDF = (reportData: any) => {
    try {
      pdfReportService.downloadReport(reportData, brandName)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const clearConversation = () => {
    setMessages([])
    enhancedChatService.clearHistory(user?.id || "anonymous")
    const welcomeMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `Hello ${user?.name || "there"}! The chat has been cleared. How can I assist you now?`,
      timestamp: new Date(),
      confidence: 1.0,
      suggestions: ["Generate a comprehensive weekly report", "List all staff members on duty today"],
    }
    setMessages([welcomeMessage])
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const quickActions = [
    { icon: Users, label: "Children Overview", query: "Show me a summary of all children enrolled" },
    { icon: Calendar, label: "Today's Schedule", query: "What's on the schedule for today?" },
    { icon: TrendingUp, label: "Attendance Trends", query: "Show me attendance trends for this month" },
    { icon: DollarSign, label: "Billing Status", query: "What's the current billing status?" },
    { icon: Heart, label: "Health Alerts", query: "Are there any health alerts I should know about?" },
    { icon: FileText, label: "Generate Report", query: "Generate a comprehensive daily report" },
  ]

  return (
    <AppShell title="Chat Assistant">
      <div className="relative overflow-hidden rounded-3xl border-2 border-blue-200/50 shadow-2xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Animated floating elements */}
        <div className="absolute top-6 right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-8 left-8 w-24 h-24 bg-white/5 rounded-full blur-xl animate-bounce" />
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-white/10 rounded-full blur-lg animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-yellow-300/20 rounded-full blur-md animate-bounce delay-500" />

        <div className="relative p-8 md:p-12 text-white">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-20 w-20 items-center justify-center bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/30 animate-bounce">
              <Bot className="h-10 w-10 text-white drop-shadow-2xl" />
              <Sparkles className="h-5 w-5 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div className="flex-1">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-2xl animate-fade-in">
                AI Chat Assistant
              </h1>
              <p className="mt-4 text-xl md:text-2xl text-blue-50/90 font-medium">
                Your intelligent companion for {brandName} management
              </p>
              <div className="flex flex-wrap items-center gap-6 mt-5 text-blue-100/90">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Database className="h-5 w-5" />
                  <span className="text-sm font-medium">Database Connected</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Brain className="h-5 w-5" />
                  <span className="text-sm font-medium">AI Powered</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Zap className="h-5 w-5" />
                  <span className="text-sm font-medium">Real-time Insights</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <FileDown className="h-5 w-5" />
                  <span className="text-sm font-medium">PDF Reports</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Section title="Quick Actions" description="Get instant insights with these common queries">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => handleSuggestionClick(action.query)}
              className="h-auto p-5 flex flex-col items-center gap-3 bg-gradient-to-br from-white via-blue-50/50 to-purple-50/30 border-2 border-blue-200/50 hover:border-blue-400 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
              disabled={isLoading}
            >
              <action.icon className="h-7 w-7 text-blue-600 group-hover:text-blue-700 group-hover:scale-110 transition-all" />
              <span className="text-xs font-semibold text-center leading-tight">{action.label}</span>
            </Button>
          ))}
        </div>
      </Section>

      {/* Chat Interface */}
      <Section title="Chat Interface" description="Ask me anything about your childcare center">
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 rounded-3xl border-2 border-blue-200/50 shadow-2xl">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-5 border-b-2 border-blue-200/50 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="w-9 h-9 text-blue-600" />
                <Sparkle className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-800">Sparky AI Assistant</h3>
                <p className="text-sm text-blue-600 font-medium">Powered by Advanced AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoSpeak(!autoSpeak)}
                className="h-9 w-9 p-0 border-blue-200 hover:bg-blue-100"
              >
                {autoSpeak ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearConversation}
                className="h-9 w-9 p-0 border-blue-200 hover:bg-blue-100 bg-transparent"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[600px] overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent to-blue-50/20">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-4 animate-fade-in", message.role === "user" ? "justify-end" : "justify-start")}
              >
                {message.role === "assistant" && (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-xl border-2 border-white">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className={cn("max-w-[80%] space-y-3", message.role === "user" && "items-end")}>
                  <div
                    className={cn(
                      "rounded-2xl px-5 py-4 text-sm shadow-xl",
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white ml-auto border-2 border-blue-300"
                        : "bg-white border-2 border-blue-200/50",
                    )}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.isLoading && !message.content ? <TypingIndicator /> : message.content}
                    </div>
                    {!message.isLoading && (
                      <div
                        className={cn(
                          "flex items-center gap-2 mt-3 text-xs opacity-70",
                          message.role === "user" ? "text-blue-100" : "text-gray-500",
                        )}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(message.timestamp)}</span>
                        {message.confidence !== undefined && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs px-2 py-0.5",
                              message.role === "user" ? "border-blue-200 text-blue-100" : "border-gray-300",
                            )}
                          >
                            {Math.round(message.confidence * 100)}%
                          </Badge>
                        )}
                        {message.role === "assistant" && (
                          <div className="flex gap-1 ml-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(message.content)}
                              className="h-6 w-6 p-0 hover:bg-blue-100"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-green-100">
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-100">
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {message.reportData && (
                    <Button
                      onClick={() => handleDownloadPDF(message.reportData)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF Report
                    </Button>
                  )}

                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Suggested follow-up questions:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs h-auto py-2 px-3 justify-start text-left bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all duration-300"
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
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center flex-shrink-0 shadow-xl border-2 border-white">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-5 border-t-2 border-blue-200/50 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-blue-50/50">
            <div className="flex gap-3">
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
                placeholder="Ask me anything about your childcare system..."
                disabled={isLoading}
                className="flex-1 h-14 bg-white/90 border-2 border-blue-200 focus:border-blue-400 rounded-xl text-base shadow-sm"
              />
              <Button
                id="send-button"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="h-14 px-8 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white border-0 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </AppShell>
  )
}
