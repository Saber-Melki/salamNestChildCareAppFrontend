export type AccentKey = "emerald" | "violet" | "amber" | "rose" | "cyan" | "lime"

export type AccentTheme = {
  navActive: string
  soft: string
  text: string
  gradFrom: string
  gradTo: string
  ring: string
  dot: string
  neonRing: string
  neonShadow: string
  hoverGlow: string
}

export const ACCENTS: Record<AccentKey, AccentTheme> = {
  emerald: {
    navActive: "bg-emerald-100 text-emerald-700",
    soft: "bg-emerald-50",
    text: "text-emerald-600",
    gradFrom: "from-emerald-500",
    gradTo: "to-lime-400",
    ring: "ring-emerald-500/40",
    dot: "bg-emerald-500",
    neonRing: "ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-white",
    neonShadow:
      "shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_8px_24px_rgba(16,185,129,0.18),0_2px_6px_rgba(16,185,129,0.12)]",
    hoverGlow:
      "hover:shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_12px_36px_rgba(16,185,129,0.28),0_3px_10px_rgba(16,185,129,0.18)]",
  },
  violet: {
    navActive: "bg-violet-100 text-violet-700",
    soft: "bg-violet-50",
    text: "text-violet-600",
    gradFrom: "from-violet-500",
    gradTo: "to-fuchsia-500",
    ring: "ring-violet-500/40",
    dot: "bg-violet-500",
    neonRing: "ring-2 ring-violet-400/50 ring-offset-2 ring-offset-white",
    neonShadow:
      "shadow-[0_0_0_1px_rgba(139,92,246,0.25),0_8px_24px_rgba(139,92,246,0.18),0_2px_6px_rgba(139,92,246,0.12)]",
    hoverGlow:
      "hover:shadow-[0_0_0_1px_rgba(139,92,246,0.25),0_12px_36px_rgba(139,92,246,0.28),0_3px_10px_rgba(139,92,246,0.18)]",
  },
  amber: {
    navActive: "bg-amber-100 text-amber-700",
    soft: "bg-amber-50",
    text: "text-amber-600",
    gradFrom: "from-amber-500",
    gradTo: "to-orange-400",
    ring: "ring-amber-500/40",
    dot: "bg-amber-500",
    neonRing: "ring-2 ring-amber-400/50 ring-offset-2 ring-offset-white",
    neonShadow:
      "shadow-[0_0_0_1px_rgba(245,158,11,0.25),0_8px_24px_rgba(245,158,11,0.18),0_2px_6px_rgba(245,158,11,0.12)]",
    hoverGlow:
      "hover:shadow-[0_0_0_1px_rgba(245,158,11,0.25),0_12px_36px_rgba(245,158,11,0.28),0_3px_10px_rgba(245,158,11,0.18)]",
  },
  rose: {
    navActive: "bg-rose-100 text-rose-700",
    soft: "bg-rose-50",
    text: "text-rose-600",
    gradFrom: "from-rose-500",
    gradTo: "to-pink-500",
    ring: "ring-rose-500/40",
    dot: "bg-rose-500",
    neonRing: "ring-2 ring-rose-400/50 ring-offset-2 ring-offset-white",
    neonShadow:
      "shadow-[0_0_0_1px_rgba(244,63,94,0.25),0_8px_24px_rgba(244,63,94,0.18),0_2px_6px_rgba(244,63,94,0.12)]",
    hoverGlow:
      "hover:shadow-[0_0_0_1px_rgba(244,63,94,0.25),0_12px_36px_rgba(244,63,94,0.28),0_3px_10px_rgba(244,63,94,0.18)]",
  },
  cyan: {
    navActive: "bg-cyan-100 text-cyan-700",
    soft: "bg-cyan-50",
    text: "text-cyan-600",
    gradFrom: "from-cyan-500",
    gradTo: "to-sky-400",
    ring: "ring-cyan-500/40",
    dot: "bg-cyan-500",
    neonRing: "ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-white",
    neonShadow:
      "shadow-[0_0_0_1px_rgba(6,182,212,0.25),0_8px_24px_rgba(6,182,212,0.18),0_2px_6px_rgba(6,182,212,0.12)]",
    hoverGlow:
      "hover:shadow-[0_0_0_1px_rgba(6,182,212,0.25),0_12px_36px_rgba(6,182,212,0.28),0_3px_10px_rgba(6,182,212,0.18)]",
  },
  lime: {
    navActive: "bg-lime-100 text-lime-700",
    soft: "bg-lime-50",
    text: "text-lime-600",
    gradFrom: "from-lime-500",
    gradTo: "to-emerald-400",
    ring: "ring-lime-500/40",
    dot: "bg-lime-500",
    neonRing: "ring-2 ring-lime-400/50 ring-offset-2 ring-offset-white",
    neonShadow:
      "shadow-[0_0_0_1px_rgba(132,204,22,0.25),0_8px_24px_rgba(132,204,22,0.18),0_2px_6px_rgba(132,204,22,0.12)]",
    hoverGlow:
      "hover:shadow-[0_0_0_1px_rgba(132,204,22,0.25),0_12px_36px_rgba(132,204,22,0.28),0_3px_10px_rgba(132,204,22,0.18)]",
  },
}

export function getAccentTheme(key?: string) {
  if (!key) return ACCENTS.emerald
  return (ACCENTS as Record<string, AccentTheme>)[key] || ACCENTS.emerald
}
