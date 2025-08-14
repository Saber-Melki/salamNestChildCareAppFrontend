"use client"

import React from "react"

export type Role = "admin" | "staff" | "parent"

type RBACContextValue = {
  role: Role
  setRole: (r: Role) => void
  can: (permission: string) => boolean
}

const rolePermissions: Record<Role, string[]> = {
  admin: [
    "view:dashboard",
    "manage:attendance",
    "manage:children",
    "manage:health",
    "manage:billing",
    "manage:scheduling",
    "view:messages",
    "view:media",
    "view:reports",
    "manage:calendar",
    "manage:settings",
    "view:parent-portal",
  ],
  staff: [
    "view:dashboard",
    "manage:attendance",
    "manage:children",
    "manage:health",
    "manage:scheduling",
    "view:messages",
    "view:media",
    "view:reports",
    "manage:calendar",
    "view:parent-portal",
  ],
  parent: ["view:dashboard", "view:messages", "view:media", "view:reports", "view:parent-portal"],
}

const RBACContext = React.createContext<RBACContextValue | null>(null)

export function RBACProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = React.useState<Role>(() => (localStorage.getItem("role") as Role) || "admin")
  React.useEffect(() => {
    localStorage.setItem("role", role)
  }, [role])

  const can = React.useCallback((permission: string) => rolePermissions[role]?.includes(permission) ?? false, [role])

  return <RBACContext.Provider value={{ role, setRole, can }}>{children}</RBACContext.Provider>
}

export function useRBAC() {
  const ctx = React.useContext(RBACContext)
  if (!ctx) throw new Error("useRBAC must be used inside RBACProvider")
  return ctx
}
