"use client"

import React from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { useRBAC } from "../contexts/rbac"
import { chatService } from "../services/chat-service"
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
} from "lucide-react"
import { cn } from "../lib/utils"
import { ChatResponse } from "../types"

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

const TypingIndicator = () => (
    <div className="flex items-center space-x-1.5 p-2">
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></span>
    </div>
);

export default function ChatPage() {
  const { user } = useRBAC()
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedProvider, setSelectedProvider] = React.useState<"openrouter" | "gemini">("gemini")
  const [autoSpeak, setAutoSpeak] = React.useState(false)

  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on mount or after message is sent
  React.useEffect(() => {
    if (!isLoading) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isLoading])

  // Initialize with welcome message
  React.useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Hello ${user?.name || "there"}! 👋 I'm Sparky, your intelligent chat assistant. I can access all your childcare center's data, generate comprehensive reports, and I now remember our conversation to provide better follow-up answers.

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
  }, [user?.name])

  const speakText = (text: string) => {
    if (autoSpeak && "speechSynthesis" in window) {
      speechSynthesis.cancel() // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      utterance.pitch = 1.1
      speechSynthesis.speak(utterance)
    }
  }

  const streamResponse = (response: ChatResponse) => {
    const words = response.answer.split(/(\s+)/);
    let streamedContent = "";

    setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.isLoading = false;
        }
        return newMessages;
    });

    words.forEach((word, index) => {
        setTimeout(() => {
            streamedContent += word;
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = streamedContent;
                }
                return newMessages;
            });

            if (index === words.length - 1) {
                speakText(response.answer);
            }
        }, index * 40); // Adjust typing speed delay here
    });
  };

  const handleSendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedInput,
      timestamp: new Date(),
    };
    
    // Keep a slice of the last 6 messages for conversational context
    const history = messages.slice(-6);

    const loadingMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "", // Content will be streamed in
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const serviceQuery = selectedProvider === "gemini" ? chatService.queryWithGemini : chatService.queryWithOpenRouter;
      const response = await serviceQuery(userMessage.content, user?.id || "anonymous", history);

      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if(lastMessage) {
            lastMessage.confidence = response.confidence;
            lastMessage.sources = response.sources;
            lastMessage.suggestions = response.suggestions;
            lastMessage.timestamp = response.timestamp;
        }
        return newMessages;
      });

      streamResponse(response);

    } catch (error) {
      console.error("Chat Assistant error:", error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I apologize, but I've encountered an error. Please check the server connection and try again.",
        timestamp: new Date(),
        confidence: 0,
      };
      setMessages((prev) => prev.slice(0, -1).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    setTimeout(() => {
      // Directly call handleSendMessage as state updates might be async
      const sendButton = document.getElementById('send-button');
      if (sendButton) {
        sendButton.click();
      } else {
        handleSendMessage();
      }
    }, 100)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const clearConversation = () => {
    setMessages([])
    chatService.clearHistory(user?.id || "anonymous")
    const welcomeMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `Hello ${user?.name || "there"}! The chat has been cleared. How can I assist you now?`,
      timestamp: new Date(),
      confidence: 1.0,
      suggestions: [
        "Generate a comprehensive weekly report",
        "List all staff members on duty today",
      ],
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
    { icon: FileText, label: "Generate Report", query: "Generate a comprehensive weekly report" },
  ]

  return (
    <AppShell title="Chat Assistant">
      {/* Enhanced Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border shadow-2xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-6 right-8 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-8 left-8 w-20 h-20 bg-white/5 rounded-full blur-lg animate-bounce" />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-white/10 rounded-full blur-md animate-pulse delay-1000" />
        <div className="relative p-8 md:p-12 text-white">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-16 w-16 items-center justify-center bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 animate-bounce">
              <Bot className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent drop-shadow-lg">
                Chat Assistant
              </h1>
              <p className="mt-3 text-xl text-blue-50/90 font-medium">
                Your intelligent companion for childcare management
              </p>
              <div className="flex items-center gap-6 mt-4 text-blue-100/80">
                <div className="flex items-center gap-2"><Database className="h-5 w-5" /><span className="text-sm font-medium">Database Connected</span></div>
                <div className="flex items-center gap-2"><Brain className="h-5 w-5" /><span className="text-sm font-medium">AI Powered</span></div>
                <div className="flex items-center gap-2"><Zap className="h-5 w-5" /><span className="text-sm font-medium">Real-time Insights</span></div>
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
              key={index} variant="outline" onClick={() => handleSuggestionClick(action.query)}
              className="h-auto p-4 flex flex-col items-center gap-3 bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-200/50 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
              disabled={isLoading}>
              <action.icon className="h-6 w-6 text-blue-600 group-hover:text-blue-700 transition-colors" />
              <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
            </Button>
          ))}
        </div>
      </Section>

      {/* Chat Interface */}
      <Section title="Chat Interface" description="Ask me anything about your childcare center">
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border-2 border-blue-200/50 shadow-lg">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-blue-200/50 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="relative"><Bot className="w-8 h-8 text-blue-600" /><Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" /></div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800">Chat Assistant</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              
              <Button variant="outline" size="sm" onClick={() => setAutoSpeak(!autoSpeak)} className="h-8 w-8 p-0 border-blue-200">
                {autoSpeak ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={clearConversation} className="h-8 w-8 p-0 border-blue-200 bg-transparent">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[600px] overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex gap-4", message.role === "user" ? "justify-end" : "justify-start")}>
                {message.role === "assistant" && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className={cn("max-w-[80%] space-y-3", message.role === "user" && "items-end")}>
                  <div className={cn("rounded-2xl px-4 py-3 text-sm shadow-lg", message.role === "user" ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto" : "bg-white border border-blue-200/50")}>
                    <div className="whitespace-pre-wrap leading-relaxed">
                        {message.isLoading && !message.content ? <TypingIndicator /> : message.content}
                    </div>
                    {!message.isLoading && (
                      <div className={cn("flex items-center gap-2 mt-3 text-xs opacity-70", message.role === "user" ? "text-blue-100" : "text-gray-500")}>
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(message.timestamp)}</span>
                        {message.confidence !== undefined && (
                          <Badge variant="outline" className={cn("text-xs px-2 py-0.5", message.role === "user" ? "border-blue-200 text-blue-100" : "border-gray-300")}>
                            {Math.round(message.confidence * 100)}%
                          </Badge>
                        )}
                        {message.role === "assistant" && (
                          <div className="flex gap-1 ml-auto">
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(message.content)} className="h-6 w-6 p-0 hover:bg-blue-100"><Copy className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-green-100"><ThumbsUp className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-100"><ThumbsDown className="w-3 h-3" /></Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-medium">💡 Suggested follow-up questions:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index} variant="outline" size="sm" onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs h-auto py-2 px-3 justify-start text-left bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
                            disabled={isLoading}>
                            <MessageCircle className="w-3 h-3 mr-2 flex-shrink-0" />
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-blue-200/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
            <div className="flex gap-3">
              <Input
                ref={inputRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {if (e.key === "Enter" && !e.shiftKey) {e.preventDefault(); handleSendMessage();}}}
                placeholder="Ask me anything about your childcare system..."
                disabled={isLoading}
                className="flex-1 h-12 bg-white/80 border-2 border-blue-200 focus:border-blue-400 rounded-xl"/>
              <Button
                id="send-button" onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading}
                className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </AppShell>
  )
}
