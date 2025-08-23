"use client"

import React from "react"
import { useNavigate } from "react-router-dom"
import { BrandingProvider, useBranding } from "../contexts/branding"
import { getAccentTheme } from "../components/theme-utils"
import { cn } from "../lib/utils"
import { Mail, Lock, Eye, EyeOff, Sparkles, ShieldCheck, ArrowRight, User, Users, Settings } from "lucide-react"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Button } from "../components/ui/button"

type Role = "admin" | "staff" | "parent"

function AuroraBG() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-emerald-400 to-lime-300" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-rose-300 to-pink-300" />
      <div className="absolute inset-0 [background-image:radial-gradient(hsl(0_0%_0%/.06)_1px,transparent_1px)] [background-size:18px_18px]" />
    </div>
  )
}

function LoginScreen() {
  const nav = useNavigate()
  const { name, logoUrl, accent } = useBranding()
  const theme = getAccentTheme(accent)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPw, setShowPw] = React.useState(false)
  const [role, setRole] = React.useState<Role>("admin")
  const [pending, setPending] = React.useState(false)

  const login = async (r?: Role) => {
    setPending(true)
    try {
      localStorage.setItem("auth:session", "demo-session")
      localStorage.setItem("role", r || role)
      nav("/", { replace: true })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AuroraBG />

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-lime-300/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-violet-400/15 to-fuchsia-300/15 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-gradient-to-br from-rose-400/25 to-pink-300/25 rounded-full blur-lg animate-pulse delay-500" />
        <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-sky-300/20 rounded-full blur-xl animate-pulse delay-700" />

        {/* Floating cards */}
        <div className="absolute top-16 right-16 transform rotate-12 opacity-60">
          <div className="w-32 h-20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg" />
        </div>
        <div className="absolute bottom-20 left-16 transform -rotate-6 opacity-40">
          <div className="w-28 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg" />
        </div>
      </div>

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left: Hero Image Section */}
        <div className="relative flex items-center justify-center p-8 lg:p-12">
          {/* Main hero image container */}
          <div className="relative w-full max-w-lg">
            {/* Floating glow effect behind image */}
            <div className="absolute -inset-8 bg-gradient-to-r from-emerald-500/20 via-lime-400/20 to-cyan-400/20 rounded-3xl blur-3xl animate-pulse" />

            {/* Main image card */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-lime-400/30 rounded-3xl blur-sm" />
              <div className="relative rounded-3xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                
                <img
                  src="/garderie.jpg"
                  alt="Happy children in classroom"
                  className="w-full h-[60vh] object-cover"

                />

                {/* Overlay content */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <img
                        src="/login-image.png"
                        width={32}
                        height={32}
                        alt="Brand logo"
                        className="rounded-lg"
                      />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">SalamNest</div>
                      <div className="text-xs text-white/80">Childcare Management System</div>
                    </div>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed">
                    Empowering childcare centers with seamless management, <br />real-time family engagement, and secure
                    operations.
                  </p>
                </div>
              </div>
            </div>

            {/* Floating feature cards */}
            <div className="absolute -top-4 -right-4 transform rotate-6">
              <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm font-medium text-purple">Secure & Compliant</span>
                </div>
              </div>
            </div>
            <br />

            <div className="absolute -bottom-4 -left-4 transform -rotate-3">
              <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-violet-400" />
                  <span className="text-sm font-medium text-white">Family Focused</span>
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 rotate-12">
              <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-xl">
                <Sparkles className="h-6 w-6 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="relative flex items-center justify-center p-6 lg:p-12">
          {/* Floating elements around form */}
          <div className="absolute top-20 left-8 w-12 h-12 bg-gradient-to-br from-emerald-400/20 to-lime-300/20 rounded-2xl rotate-45 animate-pulse delay-300" />
          <div className="absolute bottom-32 right-12 w-8 h-8 bg-gradient-to-br from-violet-400/25 to-fuchsia-300/25 rounded-full animate-pulse delay-700" />

          <div className="w-full max-w-md relative">
            {/* Mobile logo */}
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="relative">
                <img
                  src={"/graderie.jpg"}
                  width={40}
                  height={40}
                  alt="Brand logo"
                  className="rounded-xl"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
              </div>
              <div className="text-xl font-bold">{name}</div>
            </div>

            {/* Main form container with enhanced glass effect */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 via-violet-500/10 to-rose-500/10 rounded-3xl blur-2xl animate-pulse" />

              {/* Form card */}
              <div className="relative">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-white/30 via-white/10 to-white/30 rounded-2xl" />
                <div className="relative rounded-2xl bg-white/20 backdrop-blur-2xl border border-white/30 shadow-2xl p-8">
                  {/* Header with floating icon */}
                  <div className="text-center mb-8 relative">
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-lime-400 rounded-2xl flex items-center justify-center shadow-lg rotate-12">
                        <ArrowRight className="h-6 w-6 text-white -rotate-12" />
                      </div>
                    </div>
                    <br />
                    <h2 className="text-2xl font-bold text-gray-900 mt-4">Welcome back</h2>
                    <p className="text-gray-600 mt-2">Sign in to your childcare dashboard</p>
                  </div>

                  <form
                    className="space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault()
                      login()
                    }}
                  >
                    {/* Email field with floating label effect */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-lime-400/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="pl-12 h-12 bg-white/50 backdrop-blur border-white/30 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                          required
                        />
                      </div>
                    </div>

                    {/* Password field */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 to-fuchsia-400/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                        <Input
                          id="password"
                          type={showPw ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="pl-12 pr-12 h-12 bg-white/50 backdrop-blur border-white/30 focus:border-violet-500/50 focus:ring-violet-500/20"
                          required
                          minLength={4}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((s) => !s)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Role selection with enhanced styling */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">Select your role</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {(
                          [
                            { key: "admin", label: "Admin", icon: Settings, color: "violet" },
                            { key: "staff", label: "Staff", icon: Users, color: "emerald" },
                            { key: "parent", label: "Parent", icon: User, color: "pink" },
                          ] as { key: Role; label: string; icon: any; color: string }[]
                        ).map((r) => {
                          const Icon = r.icon
                          const active = role === r.key
                          return (
                            <button
                              type="button"
                              key={r.key}
                              onClick={() => setRole(r.key)}
                              className={cn(
                                "relative group flex flex-col items-center gap-2 rounded-xl p-4 text-xs font-medium transition-all",
                                "bg-white/40 backdrop-blur border border-white/40 hover:bg-white/60",
                                active && "ring-2 ring-offset-2 ring-offset-transparent",
                                active && r.color === "emerald" && "ring-emerald-500/60 bg-emerald-50/80",
                                active && r.color === "violet" && "ring-violet-500/60 bg-violet-50/80",
                                active && r.color === "rose" && "ring-rose-500/60 bg-rose-50/80",
                              )}
                              aria-pressed={active}
                            >
                              <Icon
                                className={cn(
                                  "h-5 w-5 transition-colors",
                                  active && r.color === "emerald" && "text-emerald-600",
                                  active && r.color === "violet" && "text-violet-600",
                                  active && r.color === "rose" && "text-rose-600",
                                  !active && "text-gray-500",
                                )}
                              />
                              <span
                                className={cn(
                                  active && r.color === "emerald" && "text-emerald-700",
                                  active && r.color === "violet" && "text-violet-700",
                                  active && r.color === "rose" && "text-rose-700",
                                  !active && "text-gray-600",
                                )}
                              >
                                {r.label}
                              </span>
                              {active && (
                                <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/10 rounded-xl -z-10" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Enhanced sign in button */}
                    <Button
                      type="submit"
                      className={cn(
                        "w-full h-12 text-white font-semibold shadow-xl transition-all duration-300",
                        "bg-gradient-to-r border-0 relative overflow-hidden group",
                        theme.gradFrom,
                        theme.gradTo,
                        "hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]",
                      )}
                      disabled={pending}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <div className="relative flex items-center justify-center gap-2">
                        {pending ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign in to dashboard
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </div>
                    </Button>
                  </form>

                  {/* Quick access buttons */}
                  <div className="mt-8 pt-6 border-t border-white/20">
                    <p className="text-center text-sm text-gray-600 mb-4">Quick access</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { role: "admin", icon: Settings, label: "Admin", color: "emerald" },
                        { role: "staff", icon: Users, label: "Staff", color: "violet" },
                        { role: "parent", icon: User, label: "Parent", color: "rose" },
                      ].map((item) => {
                        const Icon = item.icon
                        return (
                          <Button
                            key={item.role}
                            variant="outline"
                            size="sm"
                            className="bg-white/30 backdrop-blur border-white/40 hover:bg-white/50 transition-all duration-200 hover:scale-105"
                            onClick={() => login(item.role as Role)}
                          >
                            <Icon className="mr-2 h-4 w-4" />
                            {item.label}
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                      By signing in, you agree to our{" "}
                      <a href="#" className="text-emerald-600 hover:text-emerald-700 underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-emerald-600 hover:text-emerald-700 underline">
                        Privacy Policy
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Need help getting started?{" "}
                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium underline">
                  Contact our support team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <BrandingProvider>
      <LoginScreen />
    </BrandingProvider>
  )
}

