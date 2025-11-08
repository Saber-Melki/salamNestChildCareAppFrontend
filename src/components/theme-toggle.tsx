"use client"
import { useTheme } from "./theme-provider"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-secondary text-secondaryForeground hover:opacity-90 transition"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="text-sm font-medium">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  )
}
