import type { Config } from "tailwindcss"

// all in fixtures is set to tailwind v3 as interims solutions

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(222, 47%, 11%)",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "0.75rem",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        'slow-pulse': 'slow-pulse 6s ease-in-out infinite alternate',
        'grid-pan': 'grid-pan 10s linear infinite',
        'float-random': 'float-random 15s ease-in-out infinite alternate', // Adjusted duration
        'float-fade': 'float-fade 12s ease-in-out infinite alternate',
        'float-fade-slow': 'float-fade-slow 20s ease-in-out infinite alternate',
        'card-float': 'card-float 15s ease-in-out infinite alternate',
        'glow-pulse': 'glow-pulse 6s ease-in-out infinite alternate',
        'glow-pulse-form': 'glow-pulse-form 8s ease-in-out infinite alternate',
        'ping-strong': 'ping-strong 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float-bounce': 'float-bounce 3s ease-in-out infinite alternate',
        'bounce-icon': 'bounce-icon 1.5s ease-in-out infinite alternate',
        'spin-slow': 'spin-slow 8s linear infinite',
        'spin-fast': 'spin-fast 0.8s linear infinite',
      },
      'slow-pulse': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.05)' },
        },
        'grid-pan': {
          'from': { 'background-position': '0 0' },
          'to': { 'background-position': '18px 18px' },
        },
        'float-random': {
          '0%': { opacity: '0', transform: 'translateY(0) rotate(0deg)' },
          '25%': { opacity: '1' },
          '50%': { transform: 'translateY(-20px) rotate(10deg)' },
          '75%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateY(0) rotate(0deg)' },
        },
        'float-fade': {
          '0%, 100%': { transform: 'translateY(0) scale(1) rotate(0deg)', opacity: '0' },
          '25%': { opacity: '0.6' },
          '50%': { transform: 'translateY(-10px) scale(1.05) rotate(5deg)', opacity: '1' },
          '75%': { opacity: '0.6' },
        },
        'float-fade-slow': {
          '0%, 100%': { transform: 'translateY(0) scale(1) rotate(0deg)', opacity: '0.3' },
          '50%': { transform: 'translateY(-5px) scale(1.02) rotate(2deg)', opacity: '0.7' },
        },
        'card-float': {
          '0%, 100%': { transform: 'translateY(0) rotate(-6deg)' },
          '50%': { transform: 'translateY(-8px) rotate(6deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.2', filter: 'blur(2rem)' },
          '50%': { opacity: '0.4', filter: 'blur(2.5rem)' },
        },
        'glow-pulse-form': {
          '0%, 100%': { opacity: '0.15', filter: 'blur(2rem)' },
          '50%': { opacity: '0.25', filter: 'blur(2.5rem)' },
        },
        'ping-strong': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        'float-bounce': {
          '0%, 100%': { transform: 'translate(-50%, 0) rotate(12deg)' },
          '50%': { transform: 'translate(-50%, -5px) rotate(15deg)' },
        },
        'bounce-icon': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        'spin-slow': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        'spin-fast': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
    },
  },
  plugins: [],
}
export default config
