"use client"

import type React from "react"
import Link from "next/link"
import { Plus, CheckSquare, Users, Wallet, MessageSquare, Camera, FileText, CalendarDays, Settings } from "lucide-react"
import { Button } from "../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { cn } from "../lib/utils"
import { getAccentTheme } from "./theme-utils"

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>

export function PageHero({
  title,
  subtitle,
  icon: Icon,
  actions,
  accent,
}: {
  title: string
  subtitle?: string
  icon?: IconType
  actions?: React.ReactNode
  accent?: string
}) {
  const theme = getAccentTheme(accent)
  return (
    <div className="relative overflow-hidden rounded-2xl border shadow-sm">
      <div className={cn("absolute inset-0 bg-gradient-to-r opacity-90", theme.gradFrom, theme.gradTo)} />
      <div className="relative p-6 md:p-8 text-white">
        <div className="flex items-start gap-4">
          {Icon ? (
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur border border-white/20">
              <Icon className="h-6 w-6" />
            </div>
          ) : null}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-semibold leading-tight">{title}</h1>
            {subtitle ? <p className="mt-1 text-white/90">{subtitle}</p> : null}
          </div>
          {actions ? <div className="ml-auto hidden md:flex items-center gap-2">{actions}</div> : null}
        </div>
      </div>
    </div>
  )
}

export function StatCard({
  title,
  value,
  icon: Icon,
  hint,
  className,
}: {
  title: string
  value: string | number
  icon?: IconType
  hint?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 p-4 shadow-sm",
        "transition-all hover:shadow-md hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-3xl font-semibold tabular-nums">{value}</div>
          {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
        </div>
        {Icon ? (
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-foreground/5">
            <Icon className="h-5 w-5 opacity-80" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function QuickActions() {
  const theme = getAccentTheme(undefined)
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full border-0 shadow-lg text-white",
              "bg-gradient-to-r",
              theme.gradFrom,
              theme.gradTo,
            )}
          >
            <Plus className="h-5 w-5" />
            <span className="sr-only">Quick actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-56">
          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href="/children">
            <DropdownMenuItem className="cursor-pointer">
              <Users className="mr-2 h-4 w-4" />
              Add Child
            </DropdownMenuItem>
          </Link>
          <Link href="/attendance">
            <DropdownMenuItem className="cursor-pointer">
              <CheckSquare className="mr-2 h-4 w-4" />
              Record Check‑in
            </DropdownMenuItem>
          </Link>
          <Link href="/billing">
            <DropdownMenuItem className="cursor-pointer">
              <Wallet className="mr-2 h-4 w-4" />
              Create Invoice
            </DropdownMenuItem>
          </Link>
          <Link href="/messages">
            <DropdownMenuItem className="cursor-pointer">
              <MessageSquare className="mr-2 h-4 w-4" />
              New Message
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-xs text-muted-foreground">Media • Reports • Calendar</div>
          <div className="grid grid-cols-3 gap-1 px-1 pb-1">
            <Link href="/media" className="rounded-md hover:bg-accent px-2 py-1 text-xs flex items-center gap-1">
              <Camera className="h-3.5 w-3.5" /> Media
            </Link>
            <Link href="/reports" className="rounded-md hover:bg-accent px-2 py-1 text-xs flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" /> Reports
            </Link>
            <Link href="/calendar" className="rounded-md hover:bg-accent px-2 py-1 text-xs flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" /> Calendar
            </Link>
          </div>
          <DropdownMenuSeparator />
          <Link href="/settings">
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
