import type React from "react"
import { Outlet, useLocation, Navigate } from "react-router-dom"
import { BrandingProvider } from "../contexts/branding"
import { RBACProvider } from "../contexts/rbac"
import { ThemeProvider } from "../contexts/theme"

function publicRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const authed = Boolean(localStorage.getItem("auth:session"))
  if (!authed && location.pathname !== "/login") {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <ThemeProvider>
      <BrandingProvider>
        <RBACProvider>
          <Outlet />
        </RBACProvider>
      </BrandingProvider>
    </ThemeProvider>
  )
}
