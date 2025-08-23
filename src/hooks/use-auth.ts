"use client"

import { useState, useEffect, useCallback } from "react"
import { AuthService, type AuthUser, type LoginCredentials } from "../services/auth.service"

interface UseAuthReturn {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  error: string | null
  clearError: () => void
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const authService = AuthService.getInstance()

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      if (currentUser && authService.isAuthenticated()) {
        // Validate token
        const isValid = await authService.validateToken()
        if (isValid) {
          setUser(currentUser)
        } else {
          // Try to refresh token
          try {
            await authService.refreshToken()
            const refreshedUser = await authService.getCurrentUser()
            setUser(refreshedUser)
          } catch {
            // Refresh failed, clear auth state
            await authService.logout()
            setUser(null)
          }
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Failed to load user:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [authService])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await authService.login(credentials)
        setUser(response.data.user)
      } catch (error: any) {
        setError(error.message || "Login failed")
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [authService],
  )

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      await authService.logout()
      setUser(null)
    } catch (error: any) {
      console.error("Logout error:", error)
      // Clear local state even if API call fails
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [authService])

  const refreshToken = useCallback(async () => {
    try {
      const response = await authService.refreshToken()
      setUser(response.data.user)
    } catch (error: any) {
      setError(error.message || "Token refresh failed")
      // If refresh fails, logout user
      await logout()
      throw error
    }
  }, [authService, logout])

  // Load user on mount
  useEffect(() => {
    loadUser()
  }, [loadUser])

  // Set up token refresh interval
  useEffect(() => {
    if (!user) return

    const interval = setInterval(
      async () => {
        try {
          await refreshToken()
        } catch {
          // Refresh failed, user will be logged out
        }
      },
      15 * 60 * 1000,
    ) // Refresh every 15 minutes

    return () => clearInterval(interval)
  }, [user, refreshToken])

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshToken,
    error,
    clearError,
  }
}
