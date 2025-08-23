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
  Baby,
  Clock,
  CreditCard,
  TrendingUp,
  Bell,
  MapPin,
} from "lucide-react"
import type { Role } from "./rbac"

export type NavSection = "Overview" | "Operations" | "Engagement" | "Insights" | "System" | "Parent Portal"

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

  {
    label: "My Children",
    href: "/parent/children",
    icon: Baby,
    permission: "view:own_children",
    section: "Parent Portal",
  },
  {
    label: "Pick-up Schedule",
    href: "/parent/pickup",
    icon: Clock,
    permission: "view:own_schedule",
    section: "Parent Portal",
  },
  {
    label: "Payment History",
    href: "/parent/payments",
    icon: CreditCard,
    permission: "view:own_billing",
    section: "Parent Portal",
  },
  {
    label: "Child Progress",
    href: "/parent/progress",
    icon: TrendingUp,
    permission: "view:child_progress",
    section: "Parent Portal",
  },
  {
    label: "Notifications",
    href: "/parent/notifications",
    icon: Bell,
    permission: "view:notifications",
    section: "Parent Portal",
  },
  {
    label: "Emergency Contacts",
    href: "/parent/emergency",
    icon: MapPin,
    permission: "manage:emergency_contacts",
    section: "Parent Portal",
  },

  { label: "Messages", href: "/messages", icon: MessageSquare, permission: "view:messages", section: "Engagement" },
  { label: "Media", href: "/media", icon: Camera, permission: "view:media", section: "Engagement" },

  { label: "Reports", href: "/reports", icon: FileText, permission: "view:reports", section: "Insights" },
  { label: "Calendar", href: "/calendar", icon: CalendarDays, permission: "manage:calendar", section: "Insights" },

  { label: "Settings", href: "/settings", icon: Settings, permission: "manage:settings", section: "System" },
]

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  staff: "Staff",
  parent: "Parent",
}
