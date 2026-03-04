"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2, Lock, Mail, Eye, EyeOff, KeyRound } from "lucide-react"
import { adminLogin, getAdminUser } from "@/lib/medusa-client"
import { usePOSStore } from "@/lib/store"
import { useAuditStore } from "@/lib/audit"
import { extractRoleFromUser, getRoleLabel } from "@/lib/rbac"
import toast from "react-hot-toast"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
  const router = useRouter()
  const store = usePOSStore()
  const audit = useAuditStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Auto-redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem("pos_admin_token")) {
      router.push("/")
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { token } = await adminLogin(email, password)
      localStorage.setItem("pos_admin_token", token)

      // Get user info for session
      const userData = await getAdminUser()
      const user = userData.user
      const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email
      const role = extractRoleFromUser(user)

      store.setSession({
        staffName: name,
        staffRole: role,
        staffUserId: user.id,
        staffEmail: user.email,
      })

      // Start shift if not already started
      if (!store.shiftStart) {
        store.startShift()
        audit.addEntry({
          action: "shift_open",
          staffName: name,
          staffRole: getRoleLabel(role),
          detail: "Shift started on login",
        })
      }

      audit.addEntry({
        action: "login",
        staffName: name,
        staffRole: getRoleLabel(role),
        detail: `Logged in via email`,
      })

      toast.success(`Welcome, ${name}!`)
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen auth-gradient flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 mb-4">
            <Image src="/logo-white.png" alt="Letscase" width={36} height={36} className="dark:brightness-100 brightness-0" />
          </div>
          <h1 className="text-xl font-bold text-pos-fg">Letscase POS</h1>
          <p className="text-sm text-pos-muted mt-1">Sign in with your admin credentials</p>
        </div>

        {/* Login Card */}
        <div className="auth-card p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-pos-muted-fg mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pos-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pos-input w-full pl-10 h-11"
                  placeholder="admin@example.com"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-pos-muted-fg mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pos-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pos-input w-full pl-10 pr-11 h-11"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pos-muted hover:text-pos-fg transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pos-btn-primary w-full h-11"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => router.push("/pin-login")}
              className="text-sm text-pos-muted hover:text-brand transition-colors flex items-center gap-1.5 mx-auto"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Quick PIN Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
