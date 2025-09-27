"use client"

import { useEffect, useRef, useState } from "react"
import { AppShell } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { cn } from "../lib/utils"
import { getMessages, sendMessage } from "../services/messaging"
import {
  MessageCircle,
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Star,
  Check,
  CheckCheck,
  ImageIcon,
  Mic,
  Camera,
  Zap,
  Sparkles,
  Bell,
  BellOff,
  Pin,
  Filter,
} from "lucide-react"

type Thread = {
  id: string
  family: string
  last: string
  unread?: boolean
  avatar?: string
  lastSeen?: string
  isOnline?: boolean
  priority?: "high" | "normal" | "low"
  childName?: string
  unreadCount?: number
  isPinned?: boolean
  isMuted?: boolean
  lastMessageTime?: string
  messageType?: "text" | "image" | "file" | "audio"
}

type Message = {
  id: string
  from: "you" | "parent"
  text: string
  time: string
  status?: "sent" | "delivered" | "read"
  type?: "text" | "image" | "file" | "audio"
  reactions?: { emoji: string; count: number }[]
  isImportant?: boolean
}

const mockThreads: Thread[] = [
  {
    id: "t1",
    family: "Johnson Family",
    childName: "Emma",
    last: "Thanks for the update! Emma loved the art class today 🎨",
    unread: true,
    unreadCount: 3,
    isOnline: true,
    priority: "high",
    isPinned: true,
    lastMessageTime: "2 min ago",
    messageType: "text",
    avatar: "EJ",
  },
  {
    id: "t2",
    family: "Garcia Family",
    childName: "Sofia",
    last: "We'll be 15 minutes late for pickup today",
    unread: false,
    isOnline: false,
    lastSeen: "5 min ago",
    priority: "normal",
    lastMessageTime: "1 hour ago",
    messageType: "text",
    avatar: "GF",
  },
  {
    id: "t3",
    family: "Chen Family",
    childName: "Alex",
    last: "📸 Photo",
    unread: true,
    unreadCount: 1,
    isOnline: true,
    priority: "normal",
    lastMessageTime: "3 hours ago",
    messageType: "image",
    avatar: "CF",
  },
  {
    id: "t4",
    family: "Williams Family",
    childName: "Olivia",
    last: "🎵 Voice message",
    unread: false,
    isOnline: false,
    lastSeen: "1 day ago",
    priority: "low",
    isMuted: true,
    lastMessageTime: "Yesterday",
    messageType: "audio",
    avatar: "WF",
  },
]

const mockMessages: Record<string, Message[]> = {
  t1: [
    {
      id: "m1",
      from: "parent",
      text: "Hi! How was Emma's day today?",
      time: "10:30 AM",
      status: "read",
      type: "text",
    },
    {
      id: "m2",
      from: "you",
      text: "Emma had a wonderful day! She participated actively in our art class and made a beautiful painting. She also played well with her friends during outdoor time.",
      time: "10:45 AM",
      status: "read",
      type: "text",
      reactions: [{ emoji: "❤️", count: 1 }],
    },
    {
      id: "m3",
      from: "parent",
      text: "Thanks for the update! Emma loved the art class today 🎨",
      time: "2 min ago",
      status: "delivered",
      type: "text",
      isImportant: true,
    },
  ],
  t2: [
    {
      id: "m4",
      from: "parent",
      text: "We'll be 15 minutes late for pickup today",
      time: "1 hour ago",
      status: "read",
      type: "text",
    },
  ],
  t3: [
    {
      id: "m5",
      from: "parent",
      text: "📸 Photo",
      time: "3 hours ago",
      status: "delivered",
      type: "image",
    },
  ],
}

export default function Messages() {
  const [threads, setThreads] = useState<Thread[]>(mockThreads)
  const [active, setActive] = useState("t1")
  const [text, setText] = useState("")
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages)
  const [searchQuery, setSearchQuery] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [filterPriority, setFilterPriority] = useState<"all" | "high" | "normal" | "low">("all")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const filteredThreads = threads.filter((thread) => {
    const matchesSearch =
      thread.family.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.childName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = filterPriority === "all" || thread.priority === filterPriority
    return matchesSearch && matchesPriority
  })

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const msgs = await getMessages(active)
        setMessages((p) => ({ ...p, [active]: msgs }))
      } catch (error) {
        console.error("Failed to fetch messages:", error)
      }
    }
    fetchMessages()
  }, [active])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, active])

  const send = async () => {
    if (!text.trim()) return

    setIsTyping(true)
    try {
      const msg = await sendMessage(active, "you", text)
      setMessages((p) => ({
        ...p,
        [active]: [...(p[active] || []), msg],
      }))
      setText("")

      // Update thread's last message
      setThreads((prev) => prev.map((t) => (t.id === active ? { ...t, last: text, lastMessageTime: "now" } : t)))
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsTyping(false)
    }
  }

  const togglePin = (threadId: string) => {
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, isPinned: !t.isPinned } : t)))
  }

  const toggleMute = (threadId: string) => {
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, isMuted: !t.isMuted } : t)))
  }

  const addReaction = (messageId: string, emoji: string) => {
    setMessages((prev) => ({
      ...prev,
      [active]:
        prev[active]?.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                reactions: msg.reactions
                  ? msg.reactions.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1 } : r))
                  : [{ emoji, count: 1 }],
              }
            : msg,
        ) || [],
    }))
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "sent":
        return <Check className="w-3 h-3 text-gray-400" />
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-gray-400" />
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      default:
        return null
    }
  }

  const getMessageTypeIcon = (type?: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-4 h-4 text-blue-500" />
      case "audio":
        return <Mic className="w-4 h-4 text-green-500" />
      case "file":
        return <Paperclip className="w-4 h-4 text-gray-500" />
      default:
        return null
    }
  }

  const activeThread = threads.find((t) => t.id === active)
  const currentMessages = messages[active] || []

  return (
    <AppShell title="Messages & Communication">
      <div className="h-[calc(100vh-12rem)] bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl shadow-2xl overflow-hidden border border-white/20 backdrop-blur-sm">
        <div className="grid md:grid-cols-[380px_1fr] h-full">
          {/* Enhanced Threads List */}
          <div className="bg-white/80 backdrop-blur-md border-r border-gray-200/50">
            {/* Header */}
            <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Messages</h2>
                    <p className="text-blue-100 text-sm">Stay connected with families</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterPriority(filterPriority === "all" ? "high" : "all")}
                    className="text-white hover:bg-white/20"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                />
              </div>
            </div>

            {/* Threads */}
            <div className="overflow-y-auto h-[calc(100%-140px)] p-4 space-y-2">
              {filteredThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setActive(thread.id)}
                  className={cn(
                    "w-full text-left rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden",
                    active === thread.id
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-[1.02]"
                      : "bg-white/60 hover:bg-white/80 text-gray-800 shadow-sm",
                    thread.isPinned && "ring-2 ring-yellow-400/50",
                    thread.isMuted && "opacity-60",
                  )}
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                  <div className="relative flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm",
                          active === thread.id
                            ? "bg-white/20 text-white"
                            : "bg-gradient-to-br from-blue-400 to-purple-500 text-white",
                        )}
                      >
                        {thread.avatar}
                      </div>
                      {thread.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                      )}
                      {thread.isPinned && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Pin className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{thread.family}</h3>
                          {thread.priority === "high" && <Zap className="w-3 h-3 text-red-500" />}
                          {thread.isMuted && <BellOff className="w-3 h-3 opacity-50" />}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs opacity-70">{thread.lastMessageTime}</span>
                          {thread.unreadCount && thread.unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full animate-pulse">
                              {thread.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Child name */}
                      {thread.childName && <p className="text-xs opacity-70 mb-1">Child: {thread.childName}</p>}

                      {/* Last message */}
                      <div className="flex items-center gap-2">
                        {getMessageTypeIcon(thread.messageType)}
                        <p className="text-sm opacity-80 truncate flex-1">{thread.last}</p>
                      </div>

                      {/* Status indicators */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          {thread.isOnline ? (
                            <span className="text-xs text-green-500 font-medium">Online</span>
                          ) : (
                            <span className="text-xs opacity-50">Last seen {thread.lastSeen}</span>
                          )}
                        </div>
                        {thread.priority === "high" && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Conversation Area */}
          <div className="flex flex-col bg-gradient-to-b from-white/50 to-gray-50/50 backdrop-blur-sm">
            {activeThread ? (
              <>
                {/* Conversation Header */}
                <div className="p-6 border-b border-gray-200/50 bg-white/80 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {activeThread.avatar}
                        </div>
                        {activeThread.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{activeThread.family}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {activeThread.childName && <span>Child: {activeThread.childName}</span>}
                          <span>•</span>
                          {activeThread.isOnline ? (
                            <span className="text-green-600 font-medium">Online now</span>
                          ) : (
                            <span>Last seen {activeThread.lastSeen}</span>
                          )}
                          {isTyping && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 animate-pulse">Typing...</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="hover:bg-blue-100">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:bg-blue-100">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePin(activeThread.id)}
                        className={cn("hover:bg-blue-100", activeThread.isPinned && "text-yellow-600")}
                      >
                        <Pin className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMute(activeThread.id)}
                        className="hover:bg-blue-100"
                      >
                        {activeThread.isMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:bg-blue-100">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {currentMessages.map((message, index) => (
                    <div
                      key={message.id}
                      className={cn("flex", message.from === "you" ? "justify-end" : "justify-start")}
                    >
                      <div className={cn("max-w-[75%] group relative", message.from === "you" ? "order-2" : "order-1")}>
                        {/* Message bubble */}
                        <div
                          className={cn(
                            "px-4 py-3 rounded-2xl text-sm break-words shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]",
                            message.from === "you"
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto"
                              : "bg-white/90 text-gray-800 border border-gray-200/50",
                            message.isImportant && "ring-2 ring-yellow-400/50 animate-pulse",
                          )}
                        >
                          {message.isImportant && (
                            <div className="flex items-center gap-1 mb-2 text-yellow-300">
                              <Star className="w-3 h-3 fill-current" />
                              <span className="text-xs">Important</span>
                            </div>
                          )}

                          <div className="relative">
                            {message.text}
                            {message.isImportant && (
                              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-spin" />
                            )}
                          </div>

                          <div
                            className={cn(
                              "flex items-center justify-between mt-2 text-xs",
                              message.from === "you" ? "text-blue-100" : "text-gray-500",
                            )}
                          >
                            <span>{message.time}</span>
                            {message.from === "you" && (
                              <div className="flex items-center gap-1">{getStatusIcon(message.status)}</div>
                            )}
                          </div>
                        </div>

                        {/* Reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex gap-1 mt-2 justify-end">
                            {message.reactions.map((reaction, idx) => (
                              <button
                                key={idx}
                                className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs border border-gray-200/50 hover:bg-white transition-colors"
                                onClick={() => addReaction(message.id, reaction.emoji)}
                              >
                                <span>{reaction.emoji}</span>
                                <span>{reaction.count}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Quick reactions (show on hover) */}
                        <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="flex gap-1 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-lg border border-gray-200/50">
                            {["❤️", "👍", "😊", "🎉"].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => addReaction(message.id, emoji)}
                                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Enhanced Input Area */}
                <div className="p-6 border-t border-gray-200/50 bg-white/80 backdrop-blur-md">
                  <div className="flex items-end gap-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="hover:bg-blue-100">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:bg-blue-100">
                        <Camera className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:bg-blue-100">
                        <Mic className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type your message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                        className="pr-12 bg-white/80 border-gray-200/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-2xl"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-blue-100"
                      >
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      onClick={send}
                      disabled={!text.trim()}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl px-6"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-20 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-gray-200/50">
                      <div className="grid grid-cols-8 gap-2">
                        {[
                          "😊",
                          "😂",
                          "❤️",
                          "👍",
                          "👎",
                          "😮",
                          "😢",
                          "😡",
                          "🎉",
                          "🔥",
                          "💯",
                          "👏",
                          "🙏",
                          "💪",
                          "✨",
                          "🌟",
                        ].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setText((prev) => prev + emoji)
                              setShowEmojiPicker(false)
                            }}
                            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Select a Conversation</h3>
                  <p className="text-gray-600">Choose a family from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
