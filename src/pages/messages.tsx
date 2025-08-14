"use client"

import React from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { cn } from "../lib/utils"

type Thread = { id: string; family: string; last: string; unread?: boolean }
type Message = { id: string; from: "you" | "parent"; text: string; time: string }

export default function Messages() {
  const [threads] = React.useState<Thread[]>([
    { id: "t1", family: "Johnson", last: "Thanks!", unread: true },
    { id: "t2", family: "Garcia", last: "We'll be late", unread: false },
    { id: "t3", family: "Chen", last: "Photo loved!", unread: false },
  ])
  const [active, setActive] = React.useState("t1")
  const [text, setText] = React.useState("")
  const [messages, setMessages] = React.useState<Record<string, Message[]>>({
    t1: [
      { id: "m1", from: "parent", text: "Could you share today's report?", time: "9:15" },
      { id: "m2", from: "you", text: "Sending now.", time: "9:16" },
      { id: "m3", from: "parent", text: "Thanks!", time: "9:17" },
    ],
    t2: [{ id: "m4", from: "parent", text: "We'll be 10 minutes late", time: "8:02" }],
    t3: [{ id: "m5", from: "parent", text: "Photo loved!", time: "10:41" }],
  })

  const send = () => {
    if (!text.trim()) return
    setMessages((p) => ({
      ...p,
      [active]: [
        ...(p[active] || []),
        { id: crypto.randomUUID(), from: "you", text, time: new Date().toTimeString().slice(0, 5) },
      ],
    }))
    setText("")
  }

  return (
    <AppShell title="Messaging">
      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <Section title="Inbox">
          <div className="space-y-1">
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={cn(
                  "w-full text-left rounded-md px-3 py-2 text-sm hover:bg-neutral-100",
                  active === t.id ? "bg-neutral-100" : "",
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="font-medium">{t.family}</div>
                  {t.unread ? <span className="ml-auto inline-flex h-2 w-2 rounded-full bg-emerald-500" /> : null}
                </div>
                <div className="text-xs text-neutral-500">{t.last}</div>
              </button>
            ))}
          </div>
        </Section>
        <Section title="Conversation">
          <div className="flex flex-col h-[480px]">
            <div className="flex-1 space-y-2 overflow-auto p-1">
              {(messages[active] || []).map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    m.from === "you"
                      ? "ml-auto text-white bg-gradient-to-r from-emerald-500 to-lime-400"
                      : "bg-neutral-100",
                  )}
                >
                  <div>{m.text}</div>
                  <div className="text-[10px] opacity-80 mt-1">{m.time}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Write a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <Button onClick={send}>Send</Button>
            </div>
          </div>
        </Section>
      </div>
    </AppShell>
  )
}
