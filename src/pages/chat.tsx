"use client"

import React from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useRBAC } from "../contexts/rbac"
import { enhancedChatService } from "../services/enhanced-chat-service"
import { useBranding } from "../contexts/branding"
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  RefreshCw,
  Copy,
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
  Star,
  Flame,
  Check,
} from "lucide-react"
import { cn } from "../lib/utils"
import { universalPDFService } from "../services/universal-pdf-service"

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
  <div className="flex items-center space-x-2 p-3">
    <div className="flex space-x-1.5">
      <span className="h-2.5 w-2.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce [animation-delay:-0.3s] shadow-lg"></span>
      <span className="h-2.5 w-2.5 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-bounce [animation-delay:-0.15s] shadow-lg"></span>
      <span className="h-2.5 w-2.5 bg-gradient-to-r from-pink-400 to-red-500 rounded-full animate-bounce shadow-lg"></span>
    </div>
    <span className="text-sm text-gray-500 animate-pulse">Sparky is thinking...</span>
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
        content: `Hello ${user?.name || "there"}! 👋 I'm Sparky, your intelligent AI assistant for ${brandName}, How can I help you manage your center today?`,
        timestamp: new Date(),
        confidence: 1.0,
        suggestions: [
          "Generate a comprehensive daily report",
          "Show me today's attendance summary",
          "What's our revenue for this month?",
          "List all staff members on duty today",
        ],
      }
      setMessages([welcomeMessage])
    }
  }, [user?.name, brandName])

  const speakText = (text: string) => {
    if (autoSpeak && "speechSynthesis" in window) {
      const cleanText = text.replace(/[*/_-]+/g, " ")
      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.rate = 1
      utterance.pitch = 1.1
      utterance.lang = "en-US"
      const voices = speechSynthesis.getVoices()
      const englishVoice = voices.find((v) => v.lang.startsWith("en"))
      if (englishVoice) {
        utterance.voice = englishVoice
      }
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

    words.forEach((word, index) => {
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
      console.log("Generating PDF with report data:", reportData)

      universalPDFService.downloadReport(
        reportData.data || [],
        {
          title: `${reportData.entity.charAt(0).toUpperCase() + reportData.entity.slice(1)} Report`,
          subtitle: `Comprehensive ${reportData.entity} data analysis`,
          entity: reportData.entity,
          generatedBy: user?.name || "System Administrator",
        },
        {
          brandName: brandName,
          contact: {
            name: user?.name || "Administration Office",
            role: user?.role || "Center Director",
            email: user?.email || "admin@salamnest.com",
            phone: "+1 (555) 123-4567",
          },
        },
      )
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
    {
      icon: Users,
      label: "Children Overview",
      query: "Show me a summary of all children enrolled",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Calendar,
      label: "Today's Schedule",
      query: "What's on the schedule for today?",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: TrendingUp,
      label: "Attendance Trends",
      query: "Show me attendance trends for this month",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: DollarSign,
      label: "Billing Status",
      query: "What's the current billing status?",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Heart,
      label: "Health Alerts",
      query: "Are there any health alerts I should know about?",
      gradient: "from-red-500 to-pink-500",
    },
    {
      icon: FileText,
      label: "Generate Report",
      query: "Generate a comprehensive daily report",
      gradient: "from-indigo-500 to-purple-500",
    },
  ]

  return (
    <AppShell title="Chat Assistant">
      {/* Enhanced Mega Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] border-4 border-blue-300/30 shadow-2xl mb-8 group">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-95 animate-gradient-xy" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Mega floating elements */}
        <div className="absolute top-6 right-8 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-8 left-8 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl animate-bounce" />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-cyan-300/20 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-purple-300/30 rounded-full blur-lg animate-bounce delay-500" />
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/10 rounded-full blur-md animate-ping" />

        {/* Floating sparkles */}
        <Star className="absolute top-8 right-20 h-6 w-6 text-yellow-300 animate-bounce" />
        <Sparkles className="absolute top-16 left-16 h-7 w-7 text-pink-300 animate-pulse" />
        <Flame className="absolute bottom-12 right-32 h-6 w-6 text-orange-300 animate-bounce delay-300" />
        <Sparkle className="absolute bottom-20 left-24 h-5 w-5 text-cyan-300 animate-pulse delay-700" />

        <div className="relative p-10 md:p-16 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Mega AI avatar */}
            <div className="inline-flex h-28 w-28 items-center justify-center bg-white/20 backdrop-blur-2xl rounded-[2rem] shadow-2xl border-4 border-white/40 animate-bounce relative group-hover:scale-110 transition-transform duration-500">
              <Bot className="h-14 w-14 text-white drop-shadow-2xl" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                <h1 className="text-5xl md:text-7xl font-black leading-tight bg-gradient-to-r from-white via-yellow-100 to-pink-100 bg-clip-text text-transparent drop-shadow-2xl animate-fade-in">
                  Sparky AI
                </h1>
                <div className="flex items-center gap-1">
                  <Star className="h-6 w-6 text-yellow-300 animate-spin-slow" />
                  <Star className="h-5 w-5 text-yellow-200 animate-pulse" />
                </div>
              </div>
              <p className="mt-4 text-2xl md:text-3xl text-white font-bold drop-shadow-lg">
                Your Super-Intelligent Assistant
              </p>


              {/* Feature badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full border-2 border-white/30 shadow-lg hover:scale-105 transition-transform">
                  <Database className="h-5 w-5 text-cyan-200" />
                  <span className="text-sm font-bold">Live Data</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full border-2 border-white/30 shadow-lg hover:scale-105 transition-transform">
                  <Brain className="h-5 w-5 text-purple-200" />
                  <span className="text-sm font-bold">Smart AI</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full border-2 border-white/30 shadow-lg hover:scale-105 transition-transform">
                  <Zap className="h-5 w-5 text-yellow-200" />
                  <span className="text-sm font-bold">Lightning Fast</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full border-2 border-white/30 shadow-lg hover:scale-105 transition-transform">
                  <FileDown className="h-5 w-5 text-green-200" />
                  <span className="text-sm font-bold">PDF Export</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom glow effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-75" />
      </div>

      {/* Enhanced Quick Actions */}
      <Section
        title={
          <span className="flex items-center gap-3">
            <Zap className="h-7 w-7 text-yellow-500" />
            Quick Actions
          </span>
        }
        description="Get instant AI-powered insights with one click"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => handleSuggestionClick(action.query)}
              className="relative h-auto p-6 flex flex-col items-center gap-4 bg-white border-0 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 group overflow-hidden rounded-2xl"
              disabled={isLoading}
            >
              {/* Gradient background on hover */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  action.gradient,
                )}
              />

              {/* Icon with gradient background */}
              <div
                className={cn(
                  "relative p-4 rounded-2xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300",
                  action.gradient,
                )}
              >
                <action.icon className="h-8 w-8 text-white drop-shadow-lg" />
              </div>

              {/* Label */}
              <span className="relative text-sm font-bold text-center leading-tight text-gray-800 group-hover:text-white transition-colors duration-300 z-10">
                {action.label}
              </span>

              {/* Sparkle effect */}
              <Sparkles className="absolute top-2 right-2 h-4 w-4 text-yellow-400 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity" />
            </Button>
          ))}
        </div>
      </Section>

      {/* Mega Enhanced Chat Interface */}
      <br></br>
      <Section
        title={
          <span className="flex items-center gap-3">
            <MessageCircle className="h-7 w-7 text-purple-500" />
            Chat with Sparky
          </span>
        }
        description="Ask anything about your childcare center - I'm here to help! 💬"
      >
        <div className="relative bg-white rounded-[2rem] border-4 border-purple-200/50 shadow-2xl overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 opacity-50" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0icHVycGxlIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

          {/* Mega Chat Header */}
          <div className="relative flex items-center justify-between p-6 border-b-4 border-purple-200/50 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-xl animate-pulse">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-black text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Sparky AI Assistant
                </h3>
                <p className="text-sm text-gray-600 font-semibold flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Online & Ready to Help
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={cn(
                  "h-11 w-11 p-0 border-2 rounded-xl transition-all duration-300",
                  autoSpeak
                    ? "border-purple-400 bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg"
                    : "border-gray-300 hover:bg-purple-50",
                )}
              >
                {autoSpeak ? (
                  <Volume2 className="w-5 h-5 text-purple-600 animate-pulse" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-600" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearConversation}
                className="h-11 w-11 p-0 border-2 border-gray-300 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-300 bg-transparent"
              >
                <RefreshCw className="w-5 h-5 text-gray-600 hover:text-red-600" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="relative h-[650px] overflow-y-auto p-8 space-y-8">
            {messages.map((message, messageIndex) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-4 animate-slide-in-bottom",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
                style={{ animationDelay: `${messageIndex * 0.1}s` }}
              >
                {/* Assistant Avatar */}
                {message.role === "assistant" && (
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-xl border-3 border-white">
                      <Bot className="w-7 h-7 text-white" />
                    </div>
                    <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400 animate-pulse" />
                  </div>
                )}

                <div className={cn("max-w-[75%] space-y-3", message.role === "user" && "items-end")}>
                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "rounded-3xl px-6 py-4 shadow-xl border-2 relative overflow-hidden",
                      message.role === "user"
                        ? "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white border-blue-300 ml-auto"
                        : "bg-white border-purple-200/50",
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400" />
                    )}

                    <div className="whitespace-pre-wrap leading-relaxed text-base">
                      {message.isLoading && !message.content ? <TypingIndicator /> : message.content}
                    </div>

                    {/* Message Footer */}
                    {!message.isLoading && (
                      <div
                        className={cn(
                          "flex items-center gap-3 mt-4 pt-3 border-t text-xs",
                          message.role === "user" ? "border-white/20 text-blue-100" : "border-gray-200 text-gray-500",
                        )}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-semibold">{formatTimestamp(message.timestamp)}</span>

                        {message.role === "assistant" && (
                          <div className="flex gap-2 ml-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(message.content)}
                              className="h-7 w-7 p-0 hover:bg-purple-100 rounded-lg"
                              title="Copy message"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                 
                </div>

                {/* User Avatar */}
                {message.role === "user" && (
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-xl border-3 border-white">
                      <User className="w-7 h-7 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Mega Input Area */}
          <div className="relative p-6 border-t-4 border-purple-200/50 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
            <div className="flex gap-4">
              <div className="flex-1 relative">
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
                  placeholder="Ask Sparky anything... ✨"
                  disabled={isLoading}
                  className="h-16 bg-white border-3 border-purple-200 focus:border-purple-400 rounded-2xl text-lg px-6 shadow-lg pr-12 font-medium placeholder:text-gray-400"
                />
                <Sparkles className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400 animate-pulse" />
              </div>
              <Button
                id="send-button"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="h-16 px-10 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white border-0 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:scale-100"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Send className="w-6 h-6 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500 font-semibold">
              <span>•</span>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{messages.filter((m) => m.role === "user").length} messages sent</span>
              </div>
              <span>•</span>
            </div>
          </div>
        </div>
      </Section>

      <style jsx>{`
        @keyframes slide-in-bottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes gradient-xy {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-slide-in-bottom {
          animation: slide-in-bottom 0.5s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-gradient-xy {
          background-size: 200% 200%;
          animation: gradient-xy 15s ease infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </AppShell>
  )
}
