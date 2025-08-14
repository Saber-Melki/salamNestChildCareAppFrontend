"use client"

import React from "react"
import { AppShell, Section } from "../components/app-shell"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { addDays, endOfMonth, format, getDay, startOfMonth } from "../utils/date-utils"

type Event = { id: string; date: string; title: string }

export default function Calendar() {
  const today = new Date()
  const [month, setMonth] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const first = startOfMonth(month)
  const last = endOfMonth(month)
  const prefix = getDay(first)
  const days = last.getDate() + prefix
  const weeks = Math.ceil(days / 7)

  const events: Event[] = [
    { id: "e1", date: format(addDays(first, 3), "yyyy-MM-dd"), title: "Field Trip" },
    { id: "e2", date: format(addDays(first, 10), "yyyy-MM-dd"), title: "Center Closed" },
    { id: "e3", date: format(addDays(first, 15), "yyyy-MM-dd"), title: "Parent-Teacher" },
  ]

  const isSameDay = (a: Date, iso: string) => format(a, "yyyy-MM-dd") === iso

  return (
    <AppShell title="Calendar & Scheduling">
      <div className="space-y-6">
        <Section title="Event Calendar" description="Closures, trips, holidays and meeting bookings.">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
              Prev
            </Button>
            <div className="font-semibold">{format(month, "MMMM yyyy")}</div>
            <Button variant="outline" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
              Next
            </Button>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline">
                Sync Google
              </Button>
              <Button size="sm" variant="outline">
                Sync Outlook
              </Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2 text-xs">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-neutral-500">
                {d}
              </div>
            ))}
            {Array.from({ length: prefix }).map((_, i) => (
              <div key={`p-${i}`} />
            ))}
            {Array.from({ length: last.getDate() }).map((_, i) => {
              const date = new Date(month.getFullYear(), month.getMonth(), i + 1)
              const iso = format(date, "yyyy-MM-dd")
              const dayEvents = events.filter((e) => isSameDay(date, e.date))
              return (
                <div key={iso} className="border rounded-md p-2 min-h-24">
                  <div className="text-xs font-medium">{i + 1}</div>
                  <div className="mt-1 space-y-1">
                    {dayEvents.map((e) => (
                      <div key={e.id} className="text-[11px] rounded px-1 py-0.5 bg-emerald-100 text-emerald-800">
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {Array.from({ length: weeks * 7 - days }).map((_, i) => (
              <div key={`s-${i}`} />
            ))}
          </div>
        </Section>

        <Section title="Parent Bookings" description="Let parents request meeting slots.">
          <div className="grid gap-3 max-w-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="when">Date</Label>
                <Input id="when" type="date" />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" />
              </div>
            </div>
            <Button>Request Slot</Button>
          </div>
        </Section>
      </div>
    </AppShell>
  )
}
