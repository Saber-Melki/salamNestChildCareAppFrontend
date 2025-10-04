"use client"

import React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Bell,
  CircleUserRound,
  Search,
  Plus,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronRightSquare,
  Home,
  CheckSquare,
  Users,
  HeartPulse,
  Wallet,
  MessageSquare,
  Camera,
  FileText,
  CalendarDays,
  Settings,
  UserCog,
  DoorOpen,
  CalendarCheck2,
  Baby,
  MessageCircle,
  Bot,
  BotIcon,
} from "lucide-react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { useRBAC } from "../contexts/rbac"
import { useBranding } from "../contexts/branding"
import { getAccentTheme } from "./theme-utils"
import { cn } from "../lib/utils"

export function AuroraBG() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-emerald-400 to-lime-300" />
      <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-rose-300 to-pink-300" />
      <div className="absolute inset-0 [background-image:radial-gradient(hsl(0_0%_0%/.06)_1px,transparent_1px)] [background-size:18px_18px]" />
    </div>
  )
}

export function Section({
  title,
  description,
  children,
}: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? <p className="text-sm text-neutral-500">{description}</p> : null}
      </div>
      <div className="relative group">
        <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-foreground/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        <Card className="relative p-4 rounded-xl">{children}</Card>
      </div>
    </section>
  )
}

function useCollapsedSidebar() {
  const [collapsed, setCollapsed] = React.useState<boolean>(() => localStorage.getItem("nav:collapsed") === "1")
  React.useEffect(() => {
    localStorage.setItem("nav:collapsed", collapsed ? "1" : "0")
  }, [collapsed])
  return { collapsed, setCollapsed }
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: Home, permission: "view:dashboard", section: "Overview" },
  { label: "Parent Portal", href: "/parent-portal", icon: DoorOpen, permission: "view:parent-portal", section: "Overview" },

  {
    label: "Attendance",
    href: "/attendance",
    icon: CheckSquare,
    permission: "manage:attendance",
    section: "Operations",
  },
  { label: "Children", href: "/children", icon: Baby, permission: "manage:children", section: "Operations" },
  { label: "Health", href: "/health", icon: HeartPulse, permission: "manage:health", section: "Operations" },
  { label: "Billing", href: "/billing", icon: Wallet, permission: "manage:billing", section: "Operations" },
  {
    label: "Scheduling",
    href: "/scheduling",
    icon: CalendarCheck2,
    permission: "manage:scheduling",
    section: "Operations",
  },
  { label: "Messages", href: "/messages", icon: MessageSquare, permission: "view:messages", section: "Engagement" },
  { label: "Media", href: "/media", icon: Camera, permission: "view:media", section: "Engagement" },
  { label: "Reports", href: "/reports", icon: FileText, permission: "view:reports", section: "Insights" },
  { label: "Calendar", href: "/calendar", icon: CalendarDays, permission: "manage:calendar", section: "Insights" },
  { label: "Bookings", href: "/booking", icon: Plus, permission: "manage:bookings", section: "Insights" },
  { label: "AI Assistant", href: "/ai-assistant", icon: Sparkles, permission: "view:ai-assistant", section: "Insights" },
  { label: "User Management", href: "/user-management", icon: UserCog, permission: "manage:users", section: "System"},
  { label: "Staff", href: "/staff", icon: Users, permission: "manage:settings", section: "System" },
  { label: "Chat Assistant", href: "/chat", icon: BotIcon, permission: "manage:settings", section: "System" },
  { label: "Settings", href: "/settings", icon: Settings, permission: "manage:settings", section: "System" },

]

function BrandHeader({ collapsed }: { collapsed: boolean }) {
  const { accent } = useBranding()
  const theme = getAccentTheme(accent)
  return (
    <div className="relative p-3">
      <div className="relative rounded-xl p-[1px] overflow-hidden">
        <div className={cn("absolute inset-0 bg-gradient-to-r opacity-80", theme.gradFrom, theme.gradTo)} />
        <div className="relative rounded-[11px] bg-white/70 backdrop-blur border">
          <div className={cn("relative flex items-center gap-3 h-14 px-3", collapsed && "justify-center")}>
            <div className="relative">
              <img
                src="/login-image.png"
                width={70}
                height={70}
                alt="Brand logo"
                className="rounded-lg"
              />
              <div className="absolute -top-0.5 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <div className="font-semibold leading-5">SalamNest</div>
                <div className="text-[10px] text-neutral-500">More Than Care, <br />A Place to Grow</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DesktopSidebar() {
  const { can } = useRBAC()
  const { accent } = useBranding()
  const theme = getAccentTheme(accent)
  const location = useLocation()
  const { collapsed, setCollapsed } = useCollapsedSidebar()

  const items = NAV_ITEMS.filter((n) => can(n.permission))
  const sections = ["Overview", "Operations", "Engagement", "Insights", "System"] as const
  const grouped = sections
    .map((sec) => ({ sec, items: items.filter((i) => i.section === sec) }))
    .filter((g) => g.items.length > 0)

  const SidebarWidth = collapsed ? "w-16" : "w-64"

  return (
    <aside className={cn("hidden md:flex shrink-0 border-r bg-white/60 backdrop-blur transition-all", SidebarWidth)}>
      <div className="relative flex h-full w-full flex-col">
        <div className="absolute inset-0 opacity-20 pointer-events-none" />
        <BrandHeader collapsed={collapsed} />
        <nav className="relative z-10 flex-1 overflow-auto px-3 pb-3">
          {grouped.map(({ sec, items }) => (
            <div key={sec as string}>
              {!collapsed && (
                <div className="px-3 mt-3 mb-1 text-[10px] font-medium tracking-wide text-neutral-500 uppercase">
                  {sec}
                </div>
              )}
              <ul className="space-y-1.5">
                {items.map((item) => {
                  const active = location.pathname === item.href
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className={cn(
                          "relative group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all border bg-white/50 backdrop-blur",
                          active ? theme.navActive : "hover:bg-neutral-100",
                          active ? theme.neonRing : "",
                          active ? theme.neonShadow : "",
                          theme.hoverGlow,
                          collapsed && "justify-center px-2",
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        {active && (
                          <span className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-full bg-neutral-800/70" />
                        )}
                        <Icon className="h-4 w-4" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                        {!collapsed && item.label === "Messages" && (
                          <Badge className="ml-auto" variant="secondary">
                            3
                          </Badge>
                        )}
                        {!collapsed && (
                          <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="relative z-10 p-3 border-t">
          <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
            <Button
              variant="outline"
              size="icon"
              className="bg-transparent"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRightSquare className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}

function Header({ title }: { title?: string }) {
  const navigate = useNavigate()
  const { role, setRole } = useRBAC()
  const { accent } = useBranding()
  const theme = getAccentTheme(accent)
  const [q, setQ] = React.useState("")

  const RoleButton = ({ r, label }: { r: any; label: string }) => (
    <button
      onClick={() => setRole(r)}
      className={cn(
        "px-2 py-1 text-xs rounded border hover:bg-neutral-100",
        role === r && "ring-2 ring-offset-2 " + theme.ring,
      )}
    >
      {label}
    </button>
  )

  return (
    <header className="relative flex h-16 items-center gap-2 border-b px-4">
      <AuroraBG />
      <div className="relative z-10 font-semibold text-base md:text-lg">{title || "Overview"}</div>
      <div className="ml-auto relative z-10 flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search children, invoices, staff..."
            className={cn("pl-8 w-[260px]")}
            aria-label="Global search"
          />
        </div>
        <Button variant="ghost" size="icon" className="relative">
  <Bell className="h-5 w-5" />
  <span className="sr-only">Notifications</span>
</Button>



<div className="hidden lg:flex items-center gap-2 ml-2">
  <RoleButton r="admin" label="Admin" />
  <RoleButton r="staff" label="Staff" />
  <RoleButton r="parent" label="Parent" />
</div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/logout")}
          className="gap-2 bg-transparent"
          title="Sign out"
        >
          <CircleUserRound className="h-5 w-5" />
          Sign out
        </Button>

      </div>
    </header>
  )
}

export function AppShell({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden">
      <AuroraBG />
      <DesktopSidebar />
      <main className="relative z-10 flex-1 flex flex-col">
        <Header title={title} />
        <div className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </div>
      </main>
    </div>
  )
}