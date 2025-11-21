"use client"

import React from "react"
import { useNavigate } from "react-router-dom"
import { Mail, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Button } from "../components/ui/button"
import { BrandingProvider, useBranding } from "../contexts/branding"
import { getAccentTheme } from "../components/theme-utils"
import { cn } from "../lib/utils"

function AuroraBG() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Top-right blob */}
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-40 bg-gradient-to-br from-emerald-400 to-lime-300 animate-pulse" />
      {/* Bottom-left blob */}
      <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full blur-3xl opacity-40 bg-gradient-to-br from-rose-300 to-pink-300 animate-pulse" />
      {/* Subtle grid */}
      <div className="absolute inset-0 [background-image:radial-gradient(hsl(0_0%_0%/.04)_1px,transparent_1px)] [background-size:18px_18px]" />
    </div>
  )
}

function ForgotPasswordInner() {
  const nav = useNavigate()
  const { accent } = useBranding()
  const theme = getAccentTheme(accent)

  const [email, setEmail] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch("http://localhost:8080/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const body = await res.json().catch(() => ({} as any))

      if (!res.ok) {
        throw new Error(body.message || "Could not send reset code")
      }

      setMessage("We sent a verification code to your email. Please check your inbox.")
      // 🔁 Flow: forgot → verify-code (email passed via state)
      nav("/verify-reset-code", { replace: true, state: { email } })
    } catch (err: any) {
      console.error("Forgot password error:", err)
      setError(err.message || "Something went wrong")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black px-4">
      <AuroraBG />

      <div className="relative z-10 w-full max-w-md">
        {/* Back link */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => nav("/login")}
            className="inline-flex items-center text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back to login
          </button>
        </div>

        {/* Logo (same as VerifyResetCodePage) */}
        <div className="mb-6 flex items-center justify-center gap-3 text-gray-900 dark:text-white">
          <div className="relative">
            <img
              src={"/login-image.png"}
              width={64}
              height={64}
              alt="Brand logo"
              className="rounded-xl ring-2 ring-emerald-400/60 shadow-lg"
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <div className="text-xl font-bold drop-shadow-md tracking-tight">SalamNest</div>
        </div>

        {/* Glow around card */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-violet-500/20 to-rose-500/20 rounded-3xl blur-2xl" />
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-violet-500/10 to-rose-500/10 rounded-3xl blur-xl" />

          {/* Card */}
          <div className="relative rounded-2xl bg-white/80 dark:bg-black/30 backdrop-blur-2xl border border-white/40 dark:border-white/15 shadow-2xl p-8">
            {/* Header with icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Forgot your password?
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Enter your email and we&apos;ll send you a one-time code to start the reset process.
                </p>
              </div>
            </div>

            {/* Success message */}
            {message && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200/70 bg-emerald-50/90 text-emerald-800 px-3 py-2 text-xs dark:border-emerald-500/40 dark:bg-emerald-900/40 dark:text-emerald-50">
                <CheckCircle2 className="h-4 w-4 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200/70 bg-red-50/90 text-red-800 px-3 py-2 text-xs dark:border-red-500/40 dark:bg-red-900/40 dark:text-red-50">
                <span className="font-bold">!</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <Label
                  htmlFor="email"
                  className="text-xs font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5"
                >
                  <Mail className="h-3 w-3" />
                  Email address
                </Label>
                <div className="relative group">
                  {/* glow around input on focus */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/25 to-lime-400/25 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-11 pl-9 bg-white/70 dark:bg-white/10 backdrop-blur border-white/60 dark:border-white/25 focus:border-emerald-500/60 focus:ring-emerald-500/30 text-gray-900 dark:text-white text-sm rounded-xl"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  Use the email linked to your SalamNest account.
                </p>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={pending}
                className={cn(
                  "w-full h-11 text-white font-semibold text-sm shadow-xl transition-all duration-300",
                  "bg-gradient-to-r border-0 relative overflow-hidden group rounded-xl",
                  theme.gradFrom,
                  theme.gradTo,
                  "hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]",
                )}
              >
                {/* Shiny sweep effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-2">
                  {pending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    <>
                      Send verification code
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <BrandingProvider>
      <ForgotPasswordInner />
    </BrandingProvider>
  )
}
