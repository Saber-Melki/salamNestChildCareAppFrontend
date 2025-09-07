"use client"

import React from "react"
import { apiClient } from "../services/api-client"

export type Role = "admin" | "staff" | "parent"

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

type RBACContextValue = {
  role: Role
  setRole: (r: Role) => void
  can: (permission: string) => boolean
  user?: User
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
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
    "manage:users",
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
  const [authState, setAuthState] = React.useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  const [role, setRole] = React.useState<Role>(() => {
    if (typeof window === "undefined") return "admin"
    const savedRole = localStorage.getItem("role") as Role
    return savedRole && ["admin", "staff", "parent"].includes(savedRole) ? savedRole : "admin"
  })

  React.useEffect(() => {
    const checkAuth = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          // Try to get current user from API
          const userData = await apiClient.get<User>("/auth/me")
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          })
          setRole(userData.role)
        } catch (error) {
          // Token might be expired, clear auth state
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    }

    checkAuth()
  }, [])

  React.useEffect(() => {
    localStorage.setItem("role", role)
  }, [role])

  const login = React.useCallback(async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      await apiClient.login(email, password)
      const userData = await apiClient.get<User>("/auth/me")
      setAuthState({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
      })
      setRole(userData.role)
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
      throw error
    }
  }, [])

  const logout = React.useCallback(async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
      setRole("admin") // Reset to default role
    }
  }, [])

  const can = React.useCallback((permission: string) => rolePermissions[role]?.includes(permission) ?? false, [role])

  const user = React.useMemo(() => {
    if (authState.user) {
      return authState.user
    }

    // Fallback demo users for development
    const demoUsers = {
      admin: { id: "1", name: "Sarah Johnson", email: "sarah.johnson@childcare.com", role: "admin" as Role },
      staff: { id: "2", name: "Emily Davis", email: "emily.davis@childcare.com", role: "staff" as Role },
      parent: { id: "3", name: "Michael Brown", email: "michael.brown@parent.com", role: "parent" as Role },
    }
    return demoUsers[role]
  }, [authState.user, role])

  return (
    <RBACContext.Provider
      value={{
        role,
        setRole,
        can,
        user,
        login,
        logout,
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
      }}
    >
      {children}
    </RBACContext.Provider>
  )
}

export function useRBAC() {
  const ctx = React.useContext(RBACContext)
  if (!ctx) throw new Error("useRBAC must be used inside RBACProvider")
  return ctx
}
