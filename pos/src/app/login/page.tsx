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
    <div className="min-h-screen flex items-center justify-center bg-pos-bg p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo-white.png" alt="Letscase" width={72} height={72} className="w-18 h-18 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Letscase POS</h1>
          <p className="text-pos-muted mt-1">Sign in to start your shift</p>
        </div>

        <form onSubmit={handleLogin} className="pos-card p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-teal-200/70 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pos-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pos-input w-full pl-10"
                placeholder="admin@letscase.com"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-teal-200/70 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pos-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pos-input w-full pl-10"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="pos-btn-primary w-full h-12 text-base"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-pos-muted text-xs mt-6">
          Use your Medusa admin credentials to sign in
        </p>
        <button
          onClick={() => router.push("/pin-login")}
          className="block mx-auto mt-3 text-sm text-brand hover:text-brand/80 transition-colors"
        >
          Quick PIN Login →
        </button>
      </div>
    </div>
  )
}
