import React from "react";

import { useRBAC } from "../contexts/rbac";

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
  Badge,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Dialog } from "./ui/dialog";
import { AsyncText } from "./async-text";
import { AIResponse, ChatMessage } from "../types";
import { aiService } from "../services/aiService";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
interface AIAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function AIAssistant({ isOpen, onToggle, className }: AIAssistantProps) {
  const { user } = useRBAC();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedProvider, setSelectedProvider] = React.useState<"openrouter" | "gemini">("gemini");
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [autoSpeak, setAutoSpeak] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  React.useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  React.useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Hello ${user?.name || "there"}! I'm your AI assistant for the childcare management system. I can help you find information about children, staff, parents, attendance, billing, events, and more. What would you like to know?`,
        timestamp: new Date(),
        confidence: 1.0,
        suggestions: [
          "Show me today's attendance",
          "Tell me about the children in preschool",
          "What upcoming events do we have?",
          "Who are the teaching staff?",
        ],
      };
      setMessages([welcomeMessage]);
    }
  }, [user?.name]);

  const speakText = (text: string) => {
    if (autoSpeak && "speechSynthesis" in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    const loadingMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Thinking...",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response: AIResponse = await aiService.queryWithGemini(userMessage.content, user?.id || "anonymous");

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.answer,
        timestamp: response.timestamp,
        confidence: response.confidence,
        sources: response.sources,
        suggestions: response.suggestions,
      };

      setMessages((prev) => prev.slice(0, -1).concat(assistantMessage));
      speakText(response.answer);
    } catch (error) {
      console.error("AI Assistant error:", error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "I apologize, but I encountered an error while processing your request. Please try again or contact support if the issue persists.",
        timestamp: new Date(),
        confidence: 0,
      };
      setMessages((prev) => prev.slice(0, -1).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearConversation = () => {
    setMessages([]);
    aiService.clearHistory(user?.id || "anonymous");
    const welcomeMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `Hello ${user?.name || "there"}! I'm your AI assistant for the childcare management system. How can I help you today?`,
      timestamp: new Date(),
      confidence: 1.0,
      suggestions: [
        "Show me today's attendance",
        "Tell me about the children in preschool",
        "What upcoming events do we have?",
        "Who are the teaching staff?",
      ],
    };
    setMessages([welcomeMessage]);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 bg-white border rounded-lg shadow-2xl transition-all duration-300 flex flex-col",
        isMinimized ? "w-80 h-16" : "w-96 h-[600px]",
        className
      )}
    >
      <div className="flex items-center justify-between p-3 border-b bg-gray-50/70 rounded-t-lg">
        <div className={cn("flex items-center gap-2")}>
          <div className="relative">
            <Bot className="w-6 h-6 text-blue-600" />
            <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">
              <AsyncText>AI Assistant</AsyncText>
            </h3>
            <p className="text-xs text-gray-500">
              <AsyncText>Powered by Gemini</AsyncText>
            </p>
          </div>
        </div>

        <div className={cn("flex items-center gap-1")}>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="h-8 w-8 text-gray-500 hover:text-gray-800">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="h-8 w-8 text-gray-500 hover:text-gray-800">
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 text-gray-500 hover:text-gray-800">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    {message.isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    ) : (
                      <Bot className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                )}

                <div className={cn("max-w-[85%] space-y-2", message.role === "user" && "items-end flex flex-col")}>
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm",
                      message.role === "user" ? "bg-blue-600 text-white" : "bg-white border",
                      message.isLoading && "animate-pulse"
                    )}
                  >
                    <AsyncText showLoader={message.isLoading}>{message.content}</AsyncText>
                    {!message.isLoading && message.role === "assistant" && (
                      <div className={cn("flex items-center gap-2 mt-2 text-xs text-gray-400")}>
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(message.timestamp)}</span>
                        {message.confidence !== undefined && (
                          <Badge className="text-xs px-1 py-0 border-green-200 bg-green-50 text-green-700">
                            {Math.round(message.confidence * 100)}%
                          </Badge>
                        )}
                        <div className={cn("flex gap-1 ml-auto")}>
                          <Button variant="ghost" size="icon" onClick={() => copyToClipboard(message.content)} className="h-5 w-5 p-0 text-gray-400 hover:text-gray-700"><Copy className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5 p-0 text-gray-400 hover:text-gray-700"><ThumbsUp className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5 p-0 text-gray-400 hover:text-gray-700"><ThumbsDown className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {message.sources && message.sources.length > 0 && (
                    <div className={cn("flex gap-1 flex-wrap")}>
                      {message.sources.map((source, index) => (
                        <Badge key={index} className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {message.suggestions && message.suggestions.length > 0 && !isLoading && (
                     <div className="space-y-1 pt-2 w-full">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs h-auto py-1.5 justify-start w-full bg-white text-left"
                          disabled={isLoading}
                        >
                          <AsyncText>{suggestion}</AsyncText>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t bg-white/80 backdrop-blur-sm">
            <div className={cn("flex gap-2")}>
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={"Ask anything..."}
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} size="default" className="px-4 bg-blue-600 hover:bg-blue-700">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>

            <div className={cn("flex gap-2 mt-2 items-center")}>
              <Button variant="outline" size="sm" onClick={clearConversation} className="text-xs bg-transparent gap-1">
                <RefreshCw className="w-3 h-3" />
                <AsyncText>Clear</AsyncText>
              </Button>
              <Badge className="text-xs">
                {messages.filter((m) => m.role === "user").length} questions
              </Badge>
            </div>
          </div>
        </>
      )}

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              <AsyncText>AI Assistant Settings</AsyncText>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  <AsyncText>AI Provider</AsyncText>
                </label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={"outline"}
                    size="sm"
                    onClick={() => setSelectedProvider("openrouter")}
                    disabled
                  >
                    OpenRouter
                  </Button>
                  <Button
                    variant={"default"}
                    size="sm"
                    onClick={() => setSelectedProvider("gemini")}
                  >
                    Gemini
                  </Button>
                </div>
              </div>

              <div className={cn("flex items-center justify-between")}>
                <label className="text-sm font-medium">
                  <AsyncText>Auto-speak responses</AsyncText>
                </label>
                <Button variant="outline" size="icon" onClick={() => setAutoSpeak(!autoSpeak)} className="h-8 w-8 p-0">
                  {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </div>

              <div className="text-xs text-gray-500 space-y-1 border-t pt-4">
                <p>
                  <AsyncText>• OpenRouter: (Disabled) More accurate, better for complex queries</AsyncText>
                </p>
                <p>
                  <AsyncText>• Gemini: Faster responses, good for simple questions</AsyncText>
                </p>
              </div>
            </div>

            <div className={cn("flex gap-2 justify-end")}>
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                <AsyncText>Close</AsyncText>
              </Button>
            </div>
          </div>
        </Dialog>
    </div>
  );
}
