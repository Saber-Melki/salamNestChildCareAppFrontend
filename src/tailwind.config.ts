import type { Config } from "tailwindcss"

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // semantic surface tokens (map to CSS vars)
        bg: "hsl(var(--bg))",
        surface: "hsl(var(--surface))",
        card: "hsl(var(--card))",
        popover: "hsl(var(--popover))",

        // text
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        mutedForeground: "hsl(var(--muted-foreground))",

        // brand / accents
        primary: "hsl(var(--primary))",
        primaryForeground: "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        secondaryForeground: "hsl(var(--secondary-foreground))",
        accent: "hsl(var(--accent))",
        accentForeground: "hsl(var(--accent-foreground))",

        // states
        destructive: "hsl(var(--destructive))",
        destructiveForeground: "hsl(var(--destructive-foreground))",

        // UI chrome
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      }
    },
  },
  plugins: [],
} satisfies Config

