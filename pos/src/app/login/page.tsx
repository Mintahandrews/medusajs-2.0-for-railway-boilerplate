"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { adminLogin, getAdminUser } from "@/lib/medusa-client"
import Image from "next/image"
import { Lock, Mail, Loader2 } from "lucide-react"
import { usePOSStore } from "@/lib/store"
import { useAuditStore } from "@/lib/audit"
import { extractRoleFromUser, getRoleLabel } from "@/lib/rbac"

export default function LoginPage() {
  const router = useRouter()
  const store = usePOSStore()
  const audit = useAuditStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { token } = await adminLogin(email, password)
      localStorage.setItem("pos_admin_token", token)

      // Fetch user info and role
      const userData = await getAdminUser()
      const user = userData?.user
      const role = extractRoleFromUser(user)
      const name = user
        ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email || "Staff"
        : email

      store.setSession({
        staffName: name,
        staffRole: role,
        staffUserId: user?.id || "",
        staffEmail: user?.email || email,
      })

      audit.addEntry({
        action: "login",
        staffName: name,
        staffRole: getRoleLabel(role),
        detail: `Logged in as ${getRoleLabel(role)}`,
      })

      router.push("/")
    } catch (err: any) {
      setError(err.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen auth-gradient flex items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-5xl grid gap-10 lg:gap-14 lg:grid-cols-[1.1fr_1fr] items-center">
        <div className="text-center lg:text-left text-white space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 text-sm tracking-wide">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Secure in-store POS access
          </div>
          <div>
            <Image src="/logo-white.png" alt="Letscase" width={72} height={72} className="w-16 h-16 mx-auto lg:mx-0 mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">Letscase POS Terminal</h1>
            <p className="text-white/70 mt-3 text-base sm:text-lg">
              Track sales, manage customers, and run store operations from one streamlined dashboard.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/60 uppercase tracking-[0.2em]">Insights</p>
              <p className="text-xl font-semibold mt-2">Real-time reports</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/60 uppercase tracking-[0.2em]">Security</p>
              <p className="text-xl font-semibold mt-2">Role-based access</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="auth-card p-6 sm:p-8 space-y-6 w-full max-w-md mx-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold tracking-wide text-teal-100/80">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pos-muted pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pos-input-lg w-full pl-12"
                placeholder="admin@letscase.com"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold tracking-wide text-teal-100/80">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pos-muted pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pos-input-lg w-full pl-12"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="pos-btn-primary w-full h-12 text-base rounded-xl"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="text-center lg:text-left text-white/70 mt-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em]">Need to switch users?</p>
          <button
            onClick={() => router.push("/pin-login")}
            className="inline-flex items-center gap-2 text-sm text-brand hover:text-brand/80 transition-colors font-semibold"
          >
            Quick PIN Login
            <span aria-hidden="true">→</span>
          </button>
          <p className="text-xs text-white/50">Use your Medusa admin credentials to sign in securely.</p>
        </div>
      </div>
    </div>
  )
}
