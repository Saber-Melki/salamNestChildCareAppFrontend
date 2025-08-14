import {
  CalendarDays,
  Camera,
  CheckSquare,
  FileText,
  HeartPulse,
  Home,
  MessageSquare,
  Settings,
  Users,
  Wallet,
  Waypoints,
} from "lucide-react"
import type { Role } from "./rbac"

export type NavSection = "Overview" | "Operations" | "Engagement" | "Insights" | "System"

export type NavItem = {
  label: string
  href: string
  icon: any
  permission: string
  section: NavSection
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: Home, permission: "view:dashboard", section: "Overview" },

  {
    label: "Attendance",
    href: "/attendance",
    icon: CheckSquare,
    permission: "manage:attendance",
    section: "Operations",
  },
  { label: "Children", href: "/children", icon: Users, permission: "manage:children", section: "Operations" },
  { label: "Health", href: "/health", icon: HeartPulse, permission: "manage:health", section: "Operations" },
  { label: "Billing", href: "/billing", icon: Wallet, permission: "manage:billing", section: "Operations" },
  { label: "Scheduling", href: "/scheduling", icon: Waypoints, permission: "manage:scheduling", section: "Operations" },

  { label: "Messages", href: "/messages", icon: MessageSquare, permission: "view:messages", section: "Engagement" },
  { label: "Media", href: "/media", icon: Camera, permission: "view:media", section: "Engagement" },
  {
    label: "Parent Portal",
    href: "/parent-portal",
    icon: Users,
    permission: "view:parent-portal",
    section: "Engagement",
  },

  { label: "Reports", href: "/reports", icon: FileText, permission: "view:reports", section: "Insights" },
  { label: "Calendar", href: "/calendar", icon: CalendarDays, permission: "manage:calendar", section: "Insights" },

  { label: "Settings", href: "/settings", icon: Settings, permission: "manage:settings", section: "System" },
]

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  staff: "Staff",
  parent: "Parent",
}
