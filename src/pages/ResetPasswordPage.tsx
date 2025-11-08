import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function getApiBase() {
  // Prefer env var; fallback to local gateway
  return import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:8080";
}

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") ?? "", [params]);
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit =
    !!token && newPassword.length >= 8 && confirm === newPassword && !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!token) {
      setErr("Reset token is missing. Please use the link from your email.");
      return;
    }
    if (newPassword.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setErr("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBase()}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || `Request failed with ${res.status}`
        );
      }

      setMsg("Password changed successfully. Redirecting to login…");
      // small delay so the user sees the success
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (e: any) {
      setErr(e?.message || "Could not reset password. The link may be invalid or expired.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow p-6">
        <h1 className="text-2xl font-semibold mb-1">Reset your password</h1>
        <p className="text-sm text-gray-500 mb-6">
          {token
            ? "Enter a new password below."
            : "Reset token is missing. Please open the link from your email again."}
        </p>

        {err && <div className="mb-4 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm">{err}</div>}
        {msg && <div className="mb-4 rounded-md bg-green-50 text-green-700 px-3 py-2 text-sm">{msg}</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              New password
            </label>
            <input
              id="password"
              type={showPwd ? "text" : "password"}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              disabled={!token || submitting}
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="confirm">
              Confirm password
            </label>
            <input
              id="confirm"
              type={showPwd ? "text" : "password"}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Re-enter the password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              disabled={!token || submitting}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="showpwd"
              type="checkbox"
              className="h-4 w-4"
              checked={showPwd}
              onChange={(e) => setShowPwd(e.target.checked)}
              disabled={submitting}
            />
            <label htmlFor="showpwd" className="text-sm text-gray-600">
              Show passwords
            </label>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full rounded-lg px-4 py-2 text-white ${
              canSubmit ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {submitting ? "Updating…" : "Set new password"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full rounded-lg px-4 py-2 border mt-2 hover:bg-gray-50"
            disabled={submitting}
          >
            Back to login
          </button>
        </form>
      </div>
    </div>
  );
}
