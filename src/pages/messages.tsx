"use client"

import { useEffect, useRef, useState } from "react"
import { AppShell } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { cn } from "../lib/utils"
import {
  getThreads,
  getMessages,
  sendMessage,
  createOrGetThread,
  getMessagingRecipients,
} from "../services/messaging"
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
  UserCircle2,
} from "lucide-react"
import { useRBAC } from "../contexts/rbac"

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
  otherUserId?: string
  otherUserName?: string
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
  fromUserId?: string
}

type MessagingUser = {
  id: string
  name: string
  role: "admin" | "staff" | "parent"
  childName?: string
}

type Side = "me" | "other"

// Role-based color presets
const roleBubbleClasses: Record<string, string> = {
  admin: "bg-gradient-to-r from-violet-500 to-indigo-500 text-white",
  staff: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
  parent: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
  default: "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
}

const roleHeaderGradients: Record<string, string> = {
  admin: "from-violet-600 to-indigo-600",
  staff: "from-emerald-600 to-teal-600",
  parent: "from-amber-600 to-orange-600",
  default: "from-blue-600 to-purple-600",
}

const roleAvatarGradients: Record<string, string> = {
  admin: "bg-gradient-to-br from-violet-500 to-indigo-500",
  staff: "bg-gradient-to-br from-emerald-500 to-teal-500",
  parent: "bg-gradient-to-br from-amber-500 to-orange-500",
  default: "bg-gradient-to-br from-blue-400 to-purple-500",
}

export default function Messages() {
  const { role, user } = useRBAC()
  const currentUserId = user?.id ? String(user.id) : undefined

  const [threads, setThreads] = useState<Thread[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [text, setText] = useState("")
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [filterPriority, setFilterPriority] =
    useState<"all" | "high" | "normal" | "low">("all")
  const [loadingThreads, setLoadingThreads] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [recipients, setRecipients] = useState<MessagingUser[]>([])
  const [showNewChat, setShowNewChat] = useState(false)
  const [selectedRecipientId, setSelectedRecipientId] = useState("")
  const [creatingThread, setCreatingThread] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // map messageId -> "me" | "other", persisted in localStorage
  const [messageSides, setMessageSides] = useState<Record<string, Side>>({})

  const myBubbleClass =
    roleBubbleClasses[role as string] || roleBubbleClasses.default
  const headerGradient =
    roleHeaderGradients[role as string] || roleHeaderGradients.default
  const avatarGradient =
    roleAvatarGradients[role as string] || roleAvatarGradients.default

  // ---------- Load saved sides from localStorage ----------
  useEffect(() => {
    try {
      if (typeof window === "undefined") return
      const raw = window.localStorage.getItem("messageSides")
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, Side>
        setMessageSides(parsed)
      }
    } catch (e) {
      console.error("Failed to load messageSides from localStorage", e)
    }
  }, [])

  // ---------- Load threads ----------
  useEffect(() => {
    const fetchThreads = async () => {
      setLoadingThreads(true)
      setError(null)
      try {
        const data = await getThreads()
        const normalized = (data || []) as Thread[]
        setThreads(normalized)

        if (normalized.length > 0) {
          setActive(prev => prev ?? normalized[0].id)
        }
      } catch (err) {
        console.error("Failed to fetch threads:", err)
        setError("Unable to load conversations. Please try again later.")
      } finally {
        setLoadingThreads(false)
      }
    }

    fetchThreads()
  }, [])

  // ---------- Load recipients ----------
  useEffect(() => {
    if (role !== "staff" && role !== "admin") return

    const fetchRecipients = async () => {
      try {
        const data = await getMessagingRecipients()
        setRecipients((data || []) as MessagingUser[])
      } catch (err) {
        console.error("Failed to load messaging recipients:", err)
      }
    }

    fetchRecipients()
  }, [role])

  // ---------- Load messages when active changes ----------
  useEffect(() => {
    const fetchMessagesForThread = async () => {
      if (!active) return
      setLoadingMessages(true)
      setError(null)
      try {
        const data = await getMessages(active)
        const rawMessages = (data || []) as any[]

        const normalizedMessages: Message[] = rawMessages.map(m => {
          const rawFromUserId =
            m.fromUserId ?? m.from_user_id ?? m.senderId ?? m.userId
          const fromUserId = rawFromUserId ? String(rawFromUserId) : undefined

          let from: "you" | "parent" = "parent"

          // default side based on ids / backend flag
          if (fromUserId && currentUserId) {
            from = fromUserId === currentUserId ? "you" : "parent"
          } else if (m.from === "you" || m.from === "parent") {
            from = m.from
          }

          return {
            id: m.id,
            from,
            text: m.text ?? "",
            time: m.time ?? "",
            status: m.status,
            type: m.type ?? "text",
            reactions: m.reactions ?? [],
            isImportant: m.isImportant ?? false,
            fromUserId,
          }
        })

        setMessages(prev => ({
          ...prev,
          [active]: normalizedMessages,
        }))
      } catch (err) {
        console.error("Failed to fetch messages:", err)
        setError("Unable to load messages for this conversation.")
      } finally {
        setLoadingMessages(false)
      }
    }

    fetchMessagesForThread()
  }, [active, currentUserId])

  // ---------- Fill missing messageSides (never overwrite existing) ----------
  useEffect(() => {
    if (!active) return
    const msgs = messages[active] || []

    if (msgs.length === 0) return

    setMessageSides(prev => {
      let changed = false
      const updated: Record<string, Side> = { ...prev }

      for (const m of msgs) {
        if (!m.id) continue
        if (updated[m.id]) continue // already have side -> don't touch

        const computedMine =
          m.fromUserId && currentUserId
            ? m.fromUserId === currentUserId
            : m.from === "you"

        updated[m.id] = computedMine ? "me" : "other"
        changed = true
      }

      if (changed) {
        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              "messageSides",
              JSON.stringify(updated),
            )
          }
        } catch (e) {
          console.error("Failed to save messageSides to localStorage", e)
        }
        return updated
      }

      return prev
    })
  }, [active, messages, currentUserId])

  // ---------- Auto scroll (inside chat only) ----------
  useEffect(() => {
    if (!active) return
    const container = messagesContainerRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }, [messages, active])

  // ---------- Helper: start / get DM with user ----------
  const startConversationWith = async (targetUserId: string) => {
    if (!targetUserId) return
    setCreatingThread(true)
    setError(null)

    try {
      const backendThread = (await createOrGetThread(
        targetUserId,
      )) as Thread

      const recipient = recipients.find(r => r.id === targetUserId)

      const name =
        recipient?.name || backendThread.family || "Conversation"

      const avatar =
        recipient?.name?.[0]?.toUpperCase() ||
        backendThread.avatar ||
        name[0]?.toUpperCase() ||
        "C"

      const thread: Thread = {
        ...backendThread,
        family: name,
        avatar,
        otherUserId: targetUserId,
      }

      setThreads(prev => {
        const existing = prev.find(t => t.id === thread.id)
        if (existing) {
          return prev.map(t => (t.id === thread.id ? thread : t))
        }
        return [thread, ...prev]
      })

      setActive(thread.id)
      setShowNewChat(false)
      setSelectedRecipientId("")
    } catch (err) {
      console.error("Failed to create/get thread:", err)
      setError("Unable to start conversation. Please try again.")
    } finally {
      setCreatingThread(false)
    }
  }

  const handleStartConversation = async () => {
    if (!selectedRecipientId) return
    await startConversationWith(selectedRecipientId)
  }

  // ---------- Filtering ----------
  const filteredThreads = threads.filter(thread => {
    const q = searchQuery.toLowerCase()

    const family = thread.family ?? ""
    const childName = thread.childName ?? ""
    const otherUserName = (thread as any).otherUserName ?? ""

    const matchesSearch =
      family.toLowerCase().includes(q) ||
      childName.toLowerCase().includes(q) ||
      otherUserName.toLowerCase().includes(q)

    const matchesPriority =
      filterPriority === "all" || thread.priority === filterPriority

    return matchesSearch && matchesPriority
  })

  // ---------- Send ----------
  const send = async () => {
    if (!text.trim() || !active) return

    setIsTyping(true)
    try {
      const raw = await sendMessage(active, text)

      const rawFromUserId =
        raw.fromUserId ?? raw.from_user_id ?? raw.senderId ?? currentUserId
      const fromUserId = rawFromUserId ? String(rawFromUserId) : undefined

      let from: "you" | "parent" = "you"
      if (fromUserId && currentUserId && fromUserId !== currentUserId) {
        from = "parent"
      }

      const msg: Message = {
        id: raw.id,
        from,
        text: raw.text ?? text,
        time: raw.time ?? new Date().toLocaleTimeString(),
        status: raw.status ?? "sent",
        type: raw.type ?? "text",
        reactions: raw.reactions ?? [],
        isImportant: raw.isImportant ?? false,
        fromUserId,
      }

      setMessages(prev => ({
        ...prev,
        [active]: [...(prev[active] || []), msg],
      }))
      setText("")

      setThreads(prev =>
        prev.map(t =>
          t.id === active
            ? {
                ...t,
                last: msg.text,
                lastMessageTime: msg.time,
                unread: false,
                unreadCount: 0,
              }
            : t,
        ),
      )
    } catch (err) {
      console.error("Failed to send message:", err)
      setError("Failed to send message. Please try again.")
    } finally {
      setIsTyping(false)
    }
  }

  const togglePin = (threadId: string) => {
    setThreads(prev =>
      prev.map(t =>
        t.id === threadId ? { ...t, isPinned: !t.isPinned } : t,
      ),
    )
  }

  const toggleMute = (threadId: string) => {
    setThreads(prev =>
      prev.map(t =>
        t.id === threadId ? { ...t, isMuted: !t.isMuted } : t,
      ),
    )
  }

  const addReaction = (messageId: string, emoji: string) => {
    if (!active) return
    setMessages(prev => ({
      ...prev,
      [active]:
        prev[active]?.map(msg =>
          msg.id === messageId
            ? {
                ...msg,
                reactions: msg.reactions
                  ? msg.reactions.map(r =>
                      r.emoji === emoji
                        ? { ...r, count: r.count + 1 }
                        : r,
                    )
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

  const activeThread = active ? threads.find(t => t.id === active) : undefined
  const currentMessages: Message[] = active ? messages[active] || [] : []

  return (
    <AppShell title="Messages & Communication">
      <div className="h-[calc(100vh-12rem)] bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl shadow-2xl overflow-hidden border border-white/20 backdrop-blur-sm relative">
        {/* Error banner */}
        {error && (
          <div className="absolute top-0 left-0 right-0 z-20 bg-red-50 border-b border-red-200 text-red-700 text-xs px-4 py-2 flex items-center justify-between">
            <span>{error}</span>
            <button
              className="text-[10px] underline"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-[380px_1fr] h-full pt-0">
          {/* Threads List */}
          <div className="bg-white/80 backdrop-blur-md border-r border-gray-200/50 flex flex-col min-h-0">
            {/* Header */}
            <div
              className={cn(
                "p-6 border-b border-gray-200/50 bg-gradient-to-r text-white",
                headerGradient,
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Messages</h2>
                    <p className="text-blue-100 text-sm">
                      Stay connected with families &amp; staff
                    </p>
                    {role && (
                      <p className="text-[11px] text-blue-50/90 mt-1">
                        You are logged in as{" "}
                        <span className="font-semibold uppercase">
                          {role}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {(role === "staff" || role === "admin") && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowNewChat(prev => !prev)}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <UserCircle2 className="w-4 h-4 mr-1" />
                      New message
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setFilterPriority(
                        filterPriority === "all" ? "high" : "all",
                      )
                    }
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
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
                />
              </div>

              {/* New chat panel */}
              {showNewChat && (role === "staff" || role === "admin") && (
                <div className="mt-4 bg-white/15 border border-white/30 rounded-xl p-3 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCircle2 className="w-4 h-4" />
                    <span className="font-medium">
                      Start a new direct conversation
                    </span>
                  </div>
                  {recipients.length === 0 ? (
                    <p className="text-xs text-blue-100">
                      No recipients available yet. (Make sure your backend
                      &quot;/users/messaging-recipients&quot; endpoint returns
                      users.)
                    </p>
                  ) : (
                    <>
                      <div className="max-h-56 overflow-y-auto space-y-1 mb-3">
                        {recipients.map(u => {
                          const initials =
                            u.name
                              .split(" ")
                              .map(p => p[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase() || "U"
                          return (
                            <button
                              key={u.id}
                              onClick={() => startConversationWith(u.id)}
                              disabled={creatingThread}
                              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left bg-white/10 hover:bg-white/25 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-white/80 text-blue-700 flex items-center justify-center text-xs font-bold">
                                  {initials}
                                </div>
                                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-400 border border-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold truncate">
                                    {u.name}
                                  </span>
                                  <Badge className="text-[10px] px-1 py-0.5 bg-white/20 border-white/30">
                                    {u.role}
                                  </Badge>
                                </div>
                                {u.childName && (
                                  <p className="text-[10px] text-blue-100 truncate">
                                    Child: {u.childName}
                                  </p>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowNewChat(false)
                            setSelectedRecipientId("")
                          }}
                          className="text-white/80 hover:bg-white/10"
                        >
                          Close
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Threads list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
              {loadingThreads && threads.length === 0 && (
                <div className="text-xs text-gray-500 px-2 py-4">
                  Loading conversations...
                </div>
              )}

              {!loadingThreads && filteredThreads.length === 0 && (
                <div className="text-xs text-gray-500 px-2 py-4">
                  No conversations found.
                </div>
              )}

              {filteredThreads.map(thread => (
                <button
                  key={thread.id}
                  onClick={() => {
                    setActive(thread.id)
                    setThreads(prev =>
                      prev.map(t =>
                        t.id === thread.id
                          ? { ...t, unread: false, unreadCount: 0 }
                          : t,
                      ),
                    )
                  }}
                  className={cn(
                    "w-full text-left rounded-2xl p-4 transition-all duration-200 hover:bg-white/80 group relative overflow-hidden",
                    active === thread.id
                      ? cn(
                          "bg-gradient-to-r text-white shadow-lg",
                          role === "admin" &&
                            "from-violet-500 to-indigo-500",
                          role === "staff" &&
                            "from-emerald-500 to-teal-500",
                          role === "parent" &&
                            "from-amber-500 to-orange-500",
                          !role && "from-blue-500 to-purple-500",
                        )
                      : "bg-white/60 text-gray-800 shadow-sm",
                    thread.isPinned && "ring-2 ring-yellow-400/50",
                    thread.isMuted && "opacity-60",
                  )}
                >
                  {thread.unreadCount && thread.unreadCount > 0 && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="relative flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white",
                          active === thread.id
                            ? "bg-white/20"
                            : avatarGradient,
                        )}
                      >
                        {thread.avatar || thread.family?.[0] || "C"}
                      </div>
                      {thread.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                      )}
                      {thread.isPinned && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Pin className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">
                            {thread.family}
                          </h3>
                          {thread.priority === "high" && (
                            <Zap className="w-3 h-3 text-red-300" />
                          )}
                          {thread.isMuted && (
                            <BellOff className="w-3 h-3 opacity-70" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {thread.unreadCount &&
                            thread.unreadCount > 0 && (
                              <Badge className="bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full">
                                {thread.unreadCount}
                              </Badge>
                            )}
                        </div>
                      </div>

                      {thread.childName && (
                        <p className="text-xs opacity-80 mb-1">
                          Child: {thread.childName}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        {getMessageTypeIcon(thread.messageType)}
                        <p className="text-sm opacity-90 truncate flex-1">
                          {thread.last || (
                            <span className="italic opacity-60">
                              No messages yet
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-xs">
                          {thread.isOnline ? (
                            <span className="text-green-500 font-medium">
                              Online
                            </span>
                          ) : (
                            <span className="opacity-70">
                              {thread.lastSeen &&
                                `Last seen ${thread.lastSeen}`}
                            </span>
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

          {/* Conversation Area */}
          <div className="flex flex-col bg-gradient-to-b from-white/50 to-gray-50/50 backdrop-blur-sm relative min-h-0">
            {activeThread ? (
              <>
                {/* Conversation Header */}
                <div className="p-6 border-b border-gray-200/50 bg-white/80 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold",
                            avatarGradient,
                          )}
                        >
                          {activeThread.avatar ||
                            activeThread.family?.[0] ||
                            "C"}
                        </div>
                        {activeThread.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                          {activeThread.family}
                          {activeThread.priority === "high" && (
                            <Badge
                              variant="destructive"
                              className="text-[10px]"
                            >
                              High priority
                            </Badge>
                          )}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                          {activeThread.childName && (
                            <span>Child: {activeThread.childName}</span>
                          )}
                          <span>•</span>
                          {activeThread.isOnline ? (
                            <span className="text-green-600 font-medium">
                              Online now
                            </span>
                          ) : (
                            <span>
                              {activeThread.lastSeen &&
                                `Last seen ${activeThread.lastSeen}`}
                            </span>
                          )}
                          {typeof activeThread.unreadCount === "number" &&
                            activeThread.unreadCount > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600 font-medium">
                                  {activeThread.unreadCount} unread
                                </span>
                              </>
                            )}
                          {isTyping && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 animate-pulse">
                                Typing...
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-blue-100"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-blue-100"
                      >
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePin(activeThread.id)}
                        className={cn(
                          "hover:bg-blue-100",
                          activeThread.isPinned && "text-yellow-600",
                        )}
                      >
                        <Pin className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMute(activeThread.id)}
                        className="hover:bg-blue-100"
                      >
                        {activeThread.isMuted ? (
                          <BellOff className="w-4 h-4" />
                        ) : (
                          <Bell className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-blue-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0"
                >
                  {loadingMessages && currentMessages.length === 0 && (
                    <div className="text-xs text-gray-500">
                      Loading messages...
                    </div>
                  )}

                  {currentMessages.map(message => {
                    // Decide side:
                    // 1) use saved side if exists
                    // 2) otherwise fallback to message.from === "you"
                    const side = messageSides[message.id]
                    const isMine =
                      side !== undefined
                        ? side === "me"
                        : message.from === "you"

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          // you on the LEFT, other user on the RIGHT
                          isMine ? "justify-start" : "justify-end",
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] group relative",
                            isMine ? "order-1" : "order-2",
                          )}
                        >
                          {/* Bubble */}
                          <div
                            className={cn(
                              "px-4 py-3 rounded-2xl text-sm break-words shadow-lg backdrop-blur-sm transition-all duration-150",
                              isMine
                                ? myBubbleClass
                                : "bg-white/90 text-gray-800 border border-gray-200/50",
                              message.isImportant &&
                                "ring-2 ring-yellow-400/50",
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
                                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300" />
                              )}
                            </div>

                            {/* Inside bubble: status only */}
                            <div
                              className={cn(
                                "flex items-center justify-between mt-2 text-xs",
                                isMine
                                  ? "text-blue-100"
                                  : "text-gray-500",
                              )}
                            >
                              <span className="opacity-0 select-none">
                                ·
                              </span>
                              {isMine ? (
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(message.status)}
                                </div>
                              ) : message.status !== "read" ? (
                                <span className="text-blue-500 font-medium">
                                  New
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {/* Reactions */}
                          {message.reactions &&
                            message.reactions.length > 0 && (
                              <div className="flex gap-1 mt-2 justify-end">
                                {message.reactions.map(
                                  (reaction, idx) => (
                                    <button
                                      key={idx}
                                      className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs border border-gray-200/50 hover:bg-white transition-colors"
                                      onClick={() =>
                                        addReaction(
                                          message.id,
                                          reaction.emoji,
                                        )
                                      }
                                    >
                                      <span>{reaction.emoji}</span>
                                      <span>{reaction.count}</span>
                                    </button>
                                  ),
                                )}
                              </div>
                            )}

                          {/* Quick reactions hover bar */}
                          <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            <div className="flex gap-1 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-lg border border-gray-200/50">
                              {["❤️", "👍", "😊", "🎉"].map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() =>
                                    addReaction(message.id, emoji)
                                  }
                                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Time under bubble (Messenger-style) */}
                          <div
                            className={cn(
                              "mt-1 text-[11px] text-gray-400",
                              isMine ? "text-left" : "text-right",
                            )}
                          >
                            {message.time}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-gray-200/50 bg-white/80 backdrop-blur-md">
                  <div className="flex items-end gap-3">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-blue-100"
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-blue-100"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-blue-100"
                      >
                        <Mic className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type your message..."
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            send()
                          }
                        }}
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
                      disabled={!text.trim() || !active}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl px-6"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

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
                        ].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setText(prev => prev + emoji)
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
              <div className="flex-1 flex items-center justify-center min-h-0">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Select a Conversation
                  </h3>
                  <p className="text-gray-600">
                    {threads.length === 0
                      ? "No conversations yet."
                      : "Choose a family from the list to start messaging"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
