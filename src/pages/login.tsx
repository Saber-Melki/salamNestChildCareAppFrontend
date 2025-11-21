"use client"

import React from "react"
import { useNavigate } from "react-router-dom"
import { BrandingProvider, useBranding } from "../contexts/branding"
import { getAccentTheme } from "../components/theme-utils"
import { cn } from "../lib/utils"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  User,
  Users,
  Settings,
} from "lucide-react"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Button } from "../components/ui/button"

type Role = "admin" | "staff" | "parent"

// New component for subtle floating particles - using Tailwind animation classes
function ParticleEffect() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute bg-white/30 rounded-full blur-sm animate-float-random opacity-0"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 3}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  )
}

function AuroraBG() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-emerald-400 to-lime-300 animate-slow-pulse" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-rose-300 to-pink-300 animate-slow-pulse delay-700" />
      <div className="absolute inset-0 [background-image:radial-gradient(hsl(0_0%_0%/.04)_1px,transparent_1px)] [background-size:18px_18px] transform-gpu translate-z-0 animate-grid-pan" />
    </div>
  )
}

function LoginScreen() {
  const nav = useNavigate()
  const { accent } = useBranding()
  const theme = getAccentTheme(accent)

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPw, setShowPw] = React.useState(false)
  const [role, setRole] = React.useState<Role>("admin")
  const [pending, setPending] = React.useState(false)

  const login = async (r?: Role) => {
    setPending(true)
    try {
      const selectedRole: Role = r || role

      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          role: selectedRole,
        }),
      })

      if (!response.ok) {
        throw new Error("Invalid credentials")
      }

      const data = await response.json()
      console.log("✅ Login response:", data)
      console.log("🎉 Login successful, cookies should now be set by backend")

      // 🔹 Save role so RBAC/sidebar/header know what to show
      localStorage.setItem("role", selectedRole)

      // 🔹 Redirect based on role
      let target = "/dashboard"
      if (selectedRole === "parent") {
        target = "/parent-portal"
      } else if (selectedRole === "staff") {
        target = "/staff"
      } // admin stays /dashboard

      console.log("✅ Login successful, redirecting to:", target)
      nav(target, { replace: true })
    } catch (err: any) {
      console.error("❌ Login failed:", err)
      alert("Login failed: " + err.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <AuroraBG />
      <ParticleEffect />

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-lime-300/20 rounded-full blur-xl animate-float-fade"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-violet-400/15 to-fuchsia-300/15 rounded-3xl blur-2xl animate-float-fade"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-32 left-1/4 w-16 h-16 bg-gradient-to-br from-rose-400/25 to-pink-300/25 rounded-full blur-lg animate-float-fade"
          style={{ animationDelay: "4s" }}
        />
        <div
          className="absolute top-1/3 right-1/3 w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-sky-300/20 rounded-full blur-xl animate-float-fade"
          style={{ animationDelay: "6s" }}
        />
        <div
          className="absolute bottom-10 right-1/2 w-28 h-28 bg-gradient-to-br from-purple-400/15 to-indigo-300/15 rounded-full blur-2xl animate-float-fade"
          style={{ animationDelay: "8s" }}
        />

        {/* Floating cards */}
        <div
          className="absolute top-16 right-16 transform rotate-12 opacity-60 animate-card-float"
          style={{ animationDelay: "1s" }}
        >
          <div className="w-32 h-20 bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl shadow-lg hover:shadow-xl transition-shadow" />
        </div>
        <div
          className="absolute bottom-20 left-16 transform -rotate-6 opacity-40 animate-card-float"
          style={{ animationDelay: "3s" }}
        >
          <div className="w-28 h-16 bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl shadow-lg hover:shadow-xl transition-shadow" />
        </div>
        <div
          className="absolute top-1/4 left-1/4 transform rotate-3 opacity-30 animate-card-float"
          style={{ animationDelay: "5s" }}
        >
          <div className="w-24 h-14 bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-lg shadow-md hover:shadow-lg transition-shadow" />
        </div>
      </div>

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left: Hero Image Section */}
        <div className="relative flex items-center justify-center p-8 lg:p-12">
          <div className="relative w-full max-w-lg perspective-1000">
            <div className="absolute -inset-8 bg-gradient-to-r from-emerald-500/20 via-lime-400/20 to-cyan-400/20 rounded-3xl blur-3xl animate-glow-pulse" />

            <div className="relative group hover:rotate-x-3 hover:rotate-y-3 transition-transform duration-500 ease-in-out">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-lime-400/30 rounded-3xl blur-sm group-hover:blur-md transition-all duration-500" />
              <div className="relative rounded-3xl overflow-hidden bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl">
                <img
                  src="/garderie.jpg"
                  alt="Happy children in classroom"
                  className="w-full h-[60vh] object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <img
                        src="/login-image.png"
                        width={32}
                        height={32}
                        alt="Brand logo"
                        className="rounded-lg ring-2 ring-emerald-400/50"
                      />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                    </div>
                    <div>
                      <div className="font-bold text-lg drop-shadow-md">SalamNest</div>
                      <div className="text-xs text-white/80 drop-shadow-sm">Childcare Management System</div>
                    </div>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed drop-shadow-sm">
                    Empowering childcare centers with seamless management, <br />
                    real-time family engagement, and secure operations.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="absolute -top-4 -right-4 transform rotate-6 animate-feature-card-1"
              style={{ animationDelay: "0s" }}
            >
              <div className="bg-white/15 dark:bg-black/15 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 animate-bounce-icon" />
                  <span className="text-sm font-medium text-gray-800 dark:text-white">Secure & Compliant</span>
                </div>
              </div>
            </div>

            <div
              className="absolute -bottom-4 -left-4 transform -rotate-3 animate-feature-card-2"
              style={{ animationDelay: "1.5s" }}
            >
              <div className="bg-white/15 dark:bg-black/15 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-violet-400 animate-bounce-icon delay-200" />
                  <span className="text-sm font-medium text-gray-800 dark:text:white">Family Focused</span>
                </div>
              </div>
            </div>

            <div
              className="absolute top-1/2 -left-8 transform -translate-y-1/2 rotate-12 animate-feature-card-3"
              style={{ animationDelay: "3s" }}
            >
              <div className="bg-white/15 dark:bg-black/15 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-3 shadow-xl hover:shadow-2xl transition-shadow">
                <Sparkles className="h-6 w-6 text-amber-400 animate-spin-slow" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="relative flex items-center justify-center p-6 lg:p-12">
          <div className="absolute top-20 left-8 w-12 h-12 bg-gradient-to-br from-emerald-400/20 to-lime-300/20 rounded-2xl rotate-45 animate-float-fade-slow delay-300" />
          <div className="absolute bottom-32 right-12 w-8 h-8 bg-gradient-to-br from-violet-400/25 to-fuchsia-300/25 rounded-full animate-float-fade-slow delay-700" />

          <div className="w-full max-w-md relative z-10">
            <div className="mb-8 flex items-center justify-center gap-3 text-gray-900 dark:text-white">
              <div className="relative">
                <img
                  src={"/login-image.png"}
                  width={80}
                  height={80}
                  alt="Brand logo"
                  className="rounded-xl ring-2 ring-emerald-400/50"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
              </div>
              <div className="text-xl font-bold drop-shadow-md">SalamNest</div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/15 via-violet-500/15 to-rose-500/15 rounded-3xl blur-2xl animate-glow-pulse-form" />
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/5 via-violet-500/5 to-rose-500/5 rounded-3xl blur-xl animate-glow-pulse-form delay-500" />

              <div className="relative rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-2xl border border-white/30 dark:border-white/15 shadow-2xl p-8 transform-gpu hover:shadow-3xl transition-shadow duration-300">
                <div className="text-center mb-8 relative">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-lime-400 rounded-2xl flex items-center justify-center shadow-lg rotate-12 animate-float-bounce">
                      <ArrowRight className="h-6 w-6 text-white -rotate-12" />
                    </div>
                  </div>
                  <br />
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-4 drop-shadow-md">
                    Welcome back
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 drop-shadow-sm">
                    Sign in to your childcare dashboard
                  </p>
                </div>

                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault()
                    login()
                  }}
                >
                  {/* Email */}
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
                        className="pl-12 h-12 bg-white/50 dark:bg-white/10 backdrop-blur border-white/30 dark:border-white/15 focus:border-emerald-500/50 focus:ring-emerald-500/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  {/* Password + Forgot */}
                  <div className="space-y-2">
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
                          className="pl-12 pr-12 h-12 bg-white/50 dark:bg-white/10 backdrop-blur border-white/30 dark:border-white/15 focus:border-violet-500/50 focus:ring-violet-500/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                          required
                          minLength={4}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((s) => !s)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          aria-label={showPw ? "Hide password" : "Show password"}
                        >
                          {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => nav("/verify-reset-code")}
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 underline-offset-2 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  {/* Role selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Select your role
                    </Label>
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
                              "relative group flex flex-col items-center gap-2 rounded-xl p-4 text-xs font-medium transition-all duration-300",
                              "bg-white/40 dark:bg-black/40 backdrop-blur border border-white/40 dark:border-white/20 hover:bg-white/60 dark:hover:bg-black/60",
                              active && "ring-2 ring-offset-2 ring-offset-transparent",
                              active &&
                                r.color === "emerald" &&
                                "ring-emerald-500/60 bg-emerald-50/80 dark:bg-emerald-900/40",
                              active &&
                                r.color === "violet" &&
                                "ring-violet-500/60 bg-violet-50/80 dark:bg-violet-900/40",
                              active &&
                                r.color === "pink" &&
                                "ring-rose-500/60 bg-rose-50/80 dark:bg-rose-900/40",
                              "hover:scale-[1.03] active:scale-[0.97] hover:shadow-lg",
                            )}
                            aria-pressed={active}
                          >
                            <Icon
                              className={cn(
                                "h-5 w-5 transition-colors group-hover:scale-110",
                                active && r.color === "emerald" && "text-emerald-600 dark:text-emerald-300",
                                active && r.color === "violet" && "text-violet-600 dark:text-violet-300",
                                active && r.color === "pink" && "text-rose-600 dark:text-rose-300",
                                !active && "text-gray-500 dark:text-gray-400",
                              )}
                            />
                            <span
                              className={cn(
                                active && r.color === "emerald" && "text-emerald-700 dark:text-emerald-200",
                                active && r.color === "violet" && "text-violet-700 dark:text-violet-200",
                                active && r.color === "pink" && "text-rose-700 dark:text-rose-200",
                                !active && "text-gray-600 dark:text-gray-300",
                              )}
                            >
                              {r.label}
                            </span>
                            {active && (
                              <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/10 dark:from-white/5 dark:to-white/0 rounded-xl -z-10 animate-fade-in" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className={cn(
                      "w-full h-12 text-white font-semibold shadow-xl transition-all duration-300",
                      "bg-gradient-to-r border-0 relative overflow-hidden group",
                      theme.gradFrom,
                      theme.gradTo,
                      "hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]",
                      "dark:from-gray-700 dark:to-gray-900",
                    )}
                    disabled={pending}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="relative flex items-center justify-center gap-2">
                      {pending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-fast" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign in to dashboard
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                        </>
                      )}
                    </div>
                  </Button>
                </form>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Need help getting started?{" "}
                <a
                  href="https://colonybyte.com/en/contact"
                  className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium underline"
                >
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
