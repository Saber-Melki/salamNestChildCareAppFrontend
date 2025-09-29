
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


export const NOTE_TYPES = [
  { value: "Incident", label: "🚨 Incident Report", color: "from-red-500 to-pink-500", bgColor: "bg-red-50" },
  { value: "Medication", label: "💊 Medication", color: "from-blue-500 to-indigo-500", bgColor: "bg-blue-50" },
  { value: "Allergy", label: "⚠️ Allergy Update", color: "from-orange-500 to-amber-500", bgColor: "bg-orange-50" },
  { value: "Immunization", label: "💉 Immunization", color: "from-green-500 to-emerald-500", bgColor: "bg-green-50" },
  { value: "Checkup", label: "🩺 Health Checkup", color: "from-purple-500 to-violet-500", bgColor: "bg-purple-50" },
  { value: "Observation", label: "👁️ Observation", color: "from-teal-500 to-cyan-500", bgColor: "bg-teal-50" },
  {
    value: "Temperature",
    label: "🌡️ Temperature Check",
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-50",
  },
  { value: "Injury", label: "🩹 Injury Report", color: "from-red-600 to-rose-600", bgColor: "bg-red-50" },
];
