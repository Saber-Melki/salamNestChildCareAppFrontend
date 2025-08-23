"use client"

import React from "react"

type Branding = {
  name: string
  accent: string
  logoUrl: string
}

const defaultBranding: Branding = {
  name: "SalamNest",
  accent: "emerald",
  logoUrl: "/login-image.jpg",
}

type BrandingContextValue = Branding & {
  setName: (v: string) => void
  setAccent: (v: string) => void
  setLogoUrl: (v: string) => void
}

const BrandingContext = React.createContext<BrandingContextValue | null>(null)

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [name, setName] = React.useState<string>(() => localStorage.getItem("brand:name") || defaultBranding.name)
  const [accent, setAccent] = React.useState<string>(
    () => localStorage.getItem("brand:accent") || defaultBranding.accent,
  )
  const [logoUrl, setLogoUrl] = React.useState<string>(
    () => localStorage.getItem("brand:logo") || defaultBranding.logoUrl,
  )

  React.useEffect(() => localStorage.setItem("brand:name", name), [name])
  React.useEffect(() => localStorage.setItem("brand:accent", accent), [accent])
  React.useEffect(() => localStorage.setItem("brand:logo", logoUrl), [logoUrl])

  return (
    <BrandingContext.Provider value={{ name, accent, logoUrl, setName, setAccent, setLogoUrl }}>
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding() {
  const ctx = React.useContext(BrandingContext)
  if (!ctx) throw new Error("useBranding must be used inside BrandingProvider")
  return ctx
}
