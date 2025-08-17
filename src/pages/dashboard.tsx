import { AppShell, Section } from "../components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Progress } from "../components/ui/progress"
import { Badge } from "../components/ui/badge"
import {
  CheckSquare,
  HeartPulse,
  Users,
  Wallet,
  AlertTriangle,
  MessageSquare,
  Camera,
  CalendarDays,
  Sparkles,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { cn } from "../lib/utils"

function GradientHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl border shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-400 opacity-90" />
      <div className="relative p-6 md:p-8 text-white">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
              Welcome back — let&apos;s make today amazing
            </h1>
            <p className="mt-1 text-white/90">
              Real-time attendance, billing insights, family engagement — all in one place.
            </p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2">
            <Button variant="secondary">Open Messages</Button>
            <Button variant="secondary" className="opacity-90 hover:opacity-100">
              View Calendar
            </Button>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Attendance rate", value: "92%", bar: 92 },
            { label: "Invoices paid", value: "76%", bar: 76 },
            { label: "Parent satisfaction", value: "4.8/5", bar: 96 },
            { label: "Media shared (wk)", value: "126", bar: 65 },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/15 p-3 backdrop-blur border border-white/20">
              <div className="text-xs text-white/80">{s.label}</div>
              <div className="mt-1 text-xl font-semibold">{s.value}</div>
              <div className="mt-2 h-2 rounded-full bg-white/20">
                <div className="h-2 rounded-full bg-white/70" style={{ width: `${s.bar}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const stats = [
    { label: "Children Present", value: 42, icon: Users },
    { label: "Check-ins Today", value: 58, icon: CheckSquare },
    { label: "Open Invoices", value: 12, icon: Wallet },
    { label: "Health Alerts", value: 3, icon: HeartPulse },
  ]
  return (
    <AppShell>
      <div className="grid gap-6">
        <GradientHero />
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <Card
                key={s.label}
                className={cn("overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 rounded-xl")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-neutral-500">{s.label}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="text-3xl font-semibold tabular-nums">{s.value}</div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                    <Icon className="h-5 w-5 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Section title="Live Attendance" description="Real-time view of check-ins and check-outs.">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="/child.jpg"
                  alt="Child avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <div className="font-medium">Ava Johnson</div>
                  <div className="text-xs text-neutral-500">Checked in at 8:12 AM</div>
                </div>
                <Badge variant="secondary">Present</Badge>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src="/child.jpg"
                  alt="Child avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <div className="font-medium">Liam Garcia</div>
                  <div className="text-xs text-neutral-500">Checked out at 11:05 AM (appt.)</div>
                </div>
                <Badge variant="destructive">Away</Badge>
              </div>
            </div>
          </Section>

          <Section title="Billing Snapshot" description="Revenue and outstanding balances.">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span>Collected (Month)</span>
                  <span className="font-medium">$28,450</span>
                </div>
                <Progress value={72} className="mt-2" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Overdue</span>
                <span className="font-medium">$1,980</span>
              </div>
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">7 families overdue • 3 reminders queued</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm">Go to Billing</Button>
                <Button variant="outline" size="sm">
                  Send Reminders
                </Button>
              </div>
            </div>
          </Section>

          <Section title="Engagement" description="Messages and media activity.">
            <div className="grid gap-3">
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4 text-emerald-500" />
                <span>New parent messages</span>
                <Badge className="ml-auto">3</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Camera className="h-4 w-4 text-emerald-500" />
                <span>Photos shared today</span>
                <div className="ml-auto font-medium">26</div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-emerald-500" />
                <span>Upcoming events this week</span>
                <div className="ml-auto font-medium">4</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Open Messages
                </Button>
                <Button variant="outline" size="sm">
                  View Media
                </Button>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </AppShell>
  )
}
