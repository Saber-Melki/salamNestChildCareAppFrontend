"use client"

import React from "react"
import { useNavigate } from "react-router-dom"
import { BrandingProvider, useBranding } from "../contexts/branding"
import { getAccentTheme } from "../components/theme-utils"
import { cn } from "../lib/utils"
import { Mail, ShieldCheck, CheckCircle2, ArrowRight, Hash } from "lucide-react"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"

function AuroraBG() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-emerald-400 to-lime-300 animate-slow-pulse" />
      <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-rose-300 to-pink-300 animate-slow-pulse delay-700" />
      <div className="absolute inset-0 [background-image:radial-gradient(hsl(0_0%_0%/.04)_1px,transparent_1px)] [background-size:18px_18px] transform-gpu translate-z-0" />
    </div>
  )
}

function VerifyResetCodeScreen() {
  const nav = useNavigate()
  const { accent } = useBranding()
  const theme = getAccentTheme(accent)

  const [email, setEmail] = React.useState("")
  const [code, setCode] = React.useState("")
  const [step, setStep] = React.useState<"email" | "code">("email")
  const [pending, setPending] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch("http://localhost:8080/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json().catch(() => ({} as any))

      if (!res.ok) {
        throw new Error(data?.message || "Unable to send verification code")
      }

      setMessage("A verification code has been sent to your email.")
      setStep("code")
    } catch (err: any) {
      console.error("❌ Error sending code:", err)
      setError(err.message || "Something went wrong while sending the code.")
    } finally {
      setPending(false)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch("http://localhost:8080/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 🔥 make sure we send exactly what backend expects
        body: JSON.stringify({
          email,
          code, // 6-digit string, see onChange below
        }),
      })

      const data = await res.json().catch(() => ({} as any))
      console.log("🔍 /auth/verify-reset-code response:", data)

      if (!res.ok) {
        throw new Error(data?.message || "Invalid or expired code")
      }

      // 🔑 backend returns: { success, message, resetToken }
      const token = (data as any)?.resetToken as string | undefined

      if (!token) {
        console.error("❌ Server response does not contain resetToken:", data)
        throw new Error("Reset token missing in server response.")
      }

      // Optional: store locally too
      localStorage.setItem("resetToken", token)
      localStorage.setItem("resetEmail", email)

      // ✅ Go to the real reset password page with token + email
      const url = `/reset-password?token=${encodeURIComponent(
        token,
      )}&email=${encodeURIComponent(email)}`
      nav(url, { replace: true })
    } catch (err: any) {
      console.error("❌ Error verifying code:", err)
      setError(err.message || "Code verification failed.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black px-4">
      <AuroraBG />
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center gap-3 text-gray-900 dark:text-white">
          <div className="relative">
            <img
              src={"/login-image.png"}
              width={64}
              height={64}
              alt="Brand logo"
              className="rounded-xl ring-2 ring-emerald-400/50"
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <div className="text-xl font-bold drop-shadow-md">SalamNest</div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/15 via-violet-500/15 to-rose-500/15 rounded-3xl blur-2xl" />
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/5 via-violet-500/5 to-rose-500/5 rounded-3xl blur-xl" />

          <div className="relative rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-2xl border border-white/30 dark:border-white/15 shadow-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Verify your email to reset password
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  We’ll send a one-time code to confirm your identity before you choose a new password.
                </p>
              </div>
            </div>

            {/* Info message */}
            {message && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200/70 bg-emerald-50/80 text-emerald-800 px-3 py-2 text-xs dark:border-emerald-500/40 dark:bg-emerald-900/30 dark:text-emerald-50">
                <CheckCircle2 className="h-4 w-4 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200/70 bg-red-50/80 text-red-800 px-3 py-2 text-xs dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-50">
                <span className="font-bold">!</span>
                <span>{error}</span>
              </div>
            )}

            {step === "email" ? (
              <form onSubmit={handleSendCode} className="space-y-5">
                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="text-xs font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5"
                  >
                    <Mail className="h-3 w-3" />
                    Email address
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-lime-400/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-11 bg-white/60 dark:bg-white/10 backdrop-blur border-white/40 dark:border-white/20 focus:border-emerald-500/50 focus:ring-emerald-500/20 text-gray-900 dark:text-white text-sm"
                        required
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    Make sure this matches the email linked to your SalamNest account.
                  </p>
                </div>

                <Button
                  type="submit"
                  className={cn(
                    "w-full h-11 text-white text-sm font-semibold shadow-xl transition-all duration-300",
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
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-fast" />
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

                <button
                  type="button"
                  onClick={() => nav("/login")}
                  className="w-full text-xs text-center text-gray-600 dark:text-gray-300 hover:underline mt-1"
                >
                  Back to login
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                    <Mail className="h-3 w-3" />
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    disabled
                    className="h-10 bg-gray-100/80 dark:bg-neutral-900/60 border border-gray-200/70 dark:border-neutral-700 text-xs cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="text-[10px] text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 underline-offset-2 hover:underline"
                  >
                    Use a different email
                  </button>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="code"
                    className="text-xs font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5"
                  >
                    <Hash className="h-3 w-3" />
                    Verification code
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 to-fuchsia-400/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                    <div className="relative">
                      <Input
                        id="code"
                        type="text"
                        value={code}
                        // 🔢 keep only digits, max 6 → matches DTO /^\d{6}$/
                        onChange={(e) =>
                          setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        placeholder="Enter the 6-digit code"
                        className="h-11 bg-white/60 dark:bg-white/10 backdrop-blur border-white/40 dark:border-white/20 focus:border-violet-500/50 focus:ring-violet-500/20 text-gray-900 dark:text-white text-sm tracking-widest text-center"
                        required
                        maxLength={6}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    Check your inbox (and spam) for the latest code we sent you.
                  </p>
                </div>

                <Button
                  type="submit"
                  className={cn(
                    "w-full h-11 text-white text-sm font-semibold shadow-xl transition-all duration-300",
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
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-fast" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify code & continue
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </div>
                </Button>

                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="w-full text-xs text-center text-gray-600 dark:text-gray-300 hover:underline mt-1"
                >
                  Didn’t receive a code? Send again
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyResetCodePage() {
  return (
    <BrandingProvider>
      <VerifyResetCodeScreen />
    </BrandingProvider>
  )
}
