
import { Baby, CalendarCheck2, CalendarDays, Camera, CheckSquare, DoorOpen, FileText, HeartPulse, Home, MessageSquare, Plus, Settings, UserCog, Users, Wallet } from "lucide-react";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: Home, permission: "view:dashboard", section: "Overview" },
  { label: "Parent Portal", href: "/parent-portal", icon: DoorOpen, permission: "view:parent-portal", section: "Overview" },
  { label: "Attendance", href: "/attendance", icon: CheckSquare, permission: "manage:attendance", section: "Operations" },
  { label: "Children", href: "/children", icon: Baby, permission: "manage:children", section: "Operations" },
  { label: "Health", href: "/health", icon: HeartPulse, permission: "manage:health", section: "Operations" },
  { label: "Billing", href: "/billing", icon: Wallet, permission: "manage:billing", section: "Operations" },
  { label: "Scheduling", href: "/scheduling", icon: CalendarCheck2, permission: "manage:scheduling", section: "Operations" },
  { label: "Messages", href: "/messages", icon: MessageSquare, permission: "view:messages", section: "Engagement" },
  { label: "Media", href: "/media", icon: Camera, permission: "view:media", section: "Engagement" },
  { label: "Reports", href: "/reports", icon: FileText, permission: "view:reports", section: "Insights" },
  { label: "Calendar", href: "/calendar", icon: CalendarDays, permission: "manage:calendar", section: "Insights" },
  { label: "Bookings", href: "/booking", icon: Plus, permission: "manage:bookings", section: "Insights" },
  { label: "User Management", href: "/user-management", icon: UserCog, permission: "manage:users", section: "System"},
  { label: "Staff", href: "/staff", icon: Users, permission: "manage:settings", section: "System" },
  { label: "Settings", href: "/settings", icon: Settings, permission: "manage:settings", section: "System" },
];
