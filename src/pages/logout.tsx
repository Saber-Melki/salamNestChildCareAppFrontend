"use client"

import React from "react"
import { useNavigate } from "react-router-dom"

export default function Logout() {
  const nav = useNavigate()
  React.useEffect(() => {
    try {
      localStorage.removeItem("auth:session")
      localStorage.removeItem("role")
      localStorage.removeItem("auth:remember")
    } catch {}
    const t = setTimeout(() => nav("/login", { replace: true }), 300)
    return () => clearTimeout(t)
  }, [nav])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="p-6 w-full max-w-sm text-center space-y-3 border rounded-xl bg-white/70">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
          <svg className="h-6 w-6 text-neutral-700" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M16 17l5-5-5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M21 12H9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </div>
        <div className="text-lg font-semibold">Signing you out</div>
        <div className="text-sm text-neutral-500">Clearing your session…</div>
      </div>
    </div>
  )
}
