"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2, Delete, ArrowLeft, Lock } from "lucide-react"
import { getAdminUsers } from "@/lib/medusa-client"
import { usePOSStore } from "@/lib/store"
import { useAuditStore } from "@/lib/audit"
import { extractRoleFromUser, extractPinFromUser, getRoleLabel, getRoleBadgeClasses } from "@/lib/rbac"
import type { POSRole } from "@/lib/rbac"
import toast from "react-hot-toast"

interface StaffEntry {
  id: string
  name: string
  email: string
  role: POSRole
  pin: string | null
}

export default function PinLoginPage() {
  const router = useRouter()
  const store = usePOSStore()
  const audit = useAuditStore()

  const [staff, setStaff] = useState<StaffEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStaff, setSelectedStaff] = useState<StaffEntry | null>(null)
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [verifying, setVerifying] = useState(false)

  // Must have a valid token already (PIN login is for staff switching, not initial login)
  useEffect(() => {
    if (!localStorage.getItem("pos_admin_token")) {
      router.push("/login")
      return
    }
    loadStaff()
  }, [])

  const loadStaff = async () => {
    try {
      setLoading(true)
      const data = await getAdminUsers()
      const entries: StaffEntry[] = (data.users || [])
        .filter((u: any) => u.metadata?.pos_pin)
        .map((u: any) => ({
          id: u.id,
          name: [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email,
          email: u.email,
          role: extractRoleFromUser(u),
          pin: extractPinFromUser(u),
        }))
      setStaff(entries)
    } catch {
      toast.error("Failed to load staff list")
    } finally {
      setLoading(false)
    }
  }

  const handlePinDigit = useCallback((digit: string) => {
    if (pin.length >= 6) return
    const newPin = pin + digit
    setPin(newPin)
    setError("")

    // Auto-verify when PIN reaches expected length (4-6 digits)
    if (selectedStaff?.pin && newPin.length === selectedStaff.pin.length) {
      verifyPin(newPin)
    }
  }, [pin, selectedStaff])

  const verifyPin = async (enteredPin: string) => {
    if (!selectedStaff) return
    setVerifying(true)

    if (enteredPin === selectedStaff.pin) {
      // Switch to this staff member
      store.setSession({
        staffName: selectedStaff.name,
        staffRole: selectedStaff.role,
        staffUserId: selectedStaff.id,
        staffEmail: selectedStaff.email,
      })

      audit.addEntry({
        action: "pin_login",
        staffName: selectedStaff.name,
        staffRole: getRoleLabel(selectedStaff.role),
        detail: `Quick PIN login as ${getRoleLabel(selectedStaff.role)}`,
      })

      toast.success(`Switched to ${selectedStaff.name}`)
      router.push("/")
    } else {
      setError("Incorrect PIN")
      setPin("")
    }
    setVerifying(false)
  }

  const handleBackspace = () => {
    setPin((p) => p.slice(0, -1))
    setError("")
  }

  const handleClear = () => {
    setPin("")
    setError("")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pos-bg">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    )
  }

  // Staff selection view
  if (!selectedStaff) {
    return (
      <div className="min-h-screen bg-pos-bg flex flex-col">
        <header className="h-14 bg-pos-card border-b border-pos-border flex items-center px-4 gap-3">
          <button onClick={() => router.push("/")} className="pos-btn-ghost">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-bold text-white">Quick Staff Switch</h1>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4">
            <div className="text-center mb-6">
              <Lock className="w-10 h-10 text-brand mx-auto mb-2" />
              <p className="text-pos-muted text-sm">Select a staff member to switch</p>
            </div>

            {staff.length === 0 ? (
              <div className="pos-card p-6 text-center">
                <p className="text-pos-muted text-sm">No staff have PINs configured.</p>
                <p className="text-pos-muted text-xs mt-1">
                  An admin can set PINs in the staff management settings.
                </p>
                <button
                  onClick={() => router.push("/login")}
                  className="pos-btn-primary mt-4 text-sm"
                >
                  Use Email Login Instead
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {staff.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStaff(s)}
                    className="w-full pos-card p-4 hover:bg-white/5 transition-colors flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-lg">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">{s.name}</p>
                      <p className="text-xs text-pos-muted">{s.email}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRoleBadgeClasses(s.role)}`}>
                      {getRoleLabel(s.role)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => router.push("/login")}
              className="w-full text-center text-sm text-pos-muted hover:text-white transition-colors py-2"
            >
              Use email &amp; password instead
            </button>
          </div>
        </div>
      </div>
    )
  }

  // PIN entry view
  return (
    <div className="min-h-screen bg-pos-bg flex flex-col">
      <header className="h-14 bg-pos-card border-b border-pos-border flex items-center px-4 gap-3">
        <button onClick={() => { setSelectedStaff(null); setPin(""); setError("") }} className="pos-btn-ghost">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-bold text-white">Enter PIN</h1>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-xs space-y-6">
          {/* Staff info */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-2xl mx-auto mb-3">
              {selectedStaff.name.charAt(0).toUpperCase()}
            </div>
            <p className="text-white font-semibold">{selectedStaff.name}</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRoleBadgeClasses(selectedStaff.role)}`}>
              {getRoleLabel(selectedStaff.role)}
            </span>
          </div>

          {/* PIN dots */}
          <div className="flex justify-center gap-3">
            {Array.from({ length: selectedStaff.pin?.length || 4 }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-colors ${
                  i < pin.length
                    ? error ? "bg-red-400 border-red-400" : "bg-brand border-brand"
                    : "border-pos-border"
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-red-400 text-sm">{error}</p>
          )}

          {verifying && (
            <div className="flex justify-center">
              <Loader2 className="w-5 h-5 text-brand animate-spin" />
            </div>
          )}

          {/* Numeric pad */}
          <div className="grid grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <button
                key={d}
                onClick={() => handlePinDigit(d)}
                disabled={verifying}
                className="h-14 rounded-xl bg-pos-card border border-pos-border text-white text-xl font-semibold hover:bg-white/10 transition-colors active:scale-95"
              >
                {d}
              </button>
            ))}
            <button
              onClick={handleClear}
              disabled={verifying}
              className="h-14 rounded-xl bg-pos-card border border-pos-border text-pos-muted text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => handlePinDigit("0")}
              disabled={verifying}
              className="h-14 rounded-xl bg-pos-card border border-pos-border text-white text-xl font-semibold hover:bg-white/10 transition-colors active:scale-95"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              disabled={verifying}
              className="h-14 rounded-xl bg-pos-card border border-pos-border text-pos-muted hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
