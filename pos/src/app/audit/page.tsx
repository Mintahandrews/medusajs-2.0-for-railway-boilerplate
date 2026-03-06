"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Search, X, Loader2, Shield, Trash2,
  Filter, Clock,
} from "lucide-react"
import { usePOSStore } from "@/lib/store"
import { hasPermission } from "@/lib/rbac"
import { useAuditStore, getActionLabel, getActionColor, type AuditAction } from "@/lib/audit"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { ThemeToggle } from "@/components/theme-toggle"

const ACTION_FILTERS: { label: string; value: AuditAction | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Login/Logout", value: "login" },
  { label: "Sales", value: "sale_complete" },
  { label: "Refunds", value: "refund" },
  { label: "Discounts", value: "discount_item" },
  { label: "Drawer", value: "drawer_open" },
  { label: "Shifts", value: "shift_open" },
  { label: "Role Changes", value: "role_change" },
]

export default function AuditPage() {
  const router = useRouter()
  const store = usePOSStore()
  const audit = useAuditStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")

  // Auth + RBAC
  useEffect(() => {
    if (!localStorage.getItem("pos_admin_token")) {
      router.push("/login")
      return
    }
    if (!hasPermission(store.staffRole, "pos.audit_log")) {
      toast.error("You don't have permission to view the audit log")
      router.push("/")
    }
  }, [router, store.staffRole])

  // Filter entries
  const entries = [...audit.entries].reverse().filter((entry) => {
    if (actionFilter !== "all") {
      // Group related actions
      if (actionFilter === "login" && entry.action !== "login" && entry.action !== "logout" && entry.action !== "pin_login") return false
      if (actionFilter === "sale_complete" && entry.action !== "sale_complete" && entry.action !== "sale_void") return false
      if (actionFilter === "refund" && entry.action !== "refund") return false
      if (actionFilter === "discount_item" && entry.action !== "discount_item" && entry.action !== "discount_cart") return false
      if (actionFilter === "drawer_open" && entry.action !== "drawer_open" && entry.action !== "drawer_cash_in" && entry.action !== "drawer_cash_out") return false
      if (actionFilter === "shift_open" && entry.action !== "shift_open" && entry.action !== "shift_close") return false
      if (actionFilter === "role_change" && entry.action !== "role_change") return false
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (
        !entry.staffName.toLowerCase().includes(q) &&
        !entry.detail.toLowerCase().includes(q) &&
        !getActionLabel(entry.action).toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-pos-bg">
      {/* Header */}
      <header className="h-14 bg-pos-card border-b border-pos-border flex items-center justify-between px-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="pos-btn-ghost">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Shield className="w-5 h-5 text-brand" />
          <h1 className="text-lg font-bold text-pos-fg">Audit Log</h1>
          <span className="text-xs text-pos-muted">({entries.length} entries)</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => {
              if (confirm("Clear all audit entries? This cannot be undone.")) {
                audit.clearEntries()
                toast.success("Audit log cleared")
              }
            }}
            className="pos-btn-ghost text-xs text-red-600 dark:text-red-400"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pos-muted" />
            <input
              type="text"
              placeholder="Search by staff name or detail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pos-input-icon w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-pos-muted hover:text-pos-fg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex bg-pos-card rounded-lg p-0.5 border border-pos-border overflow-x-auto scrollbar-none">
            {ACTION_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActionFilter(f.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  actionFilter === f.value ? "bg-brand text-white" : "text-pos-muted hover:text-pos-fg"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Entries */}
        {entries.length === 0 ? (
          <div className="text-center py-12 text-pos-muted">
            <Shield className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No audit entries found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="pos-card p-3 flex items-start gap-3"
              >
                <div className="shrink-0 mt-0.5">
                  <Clock className={`w-4 h-4 ${getActionColor(entry.action)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold ${getActionColor(entry.action)}`}>
                      {getActionLabel(entry.action)}
                    </span>
                    <span className="text-[10px] text-pos-muted">·</span>
                    <span className="text-xs text-pos-fg font-medium">{entry.staffName}</span>
                    <span className="text-[10px] text-pos-muted">({entry.staffRole})</span>
                  </div>
                  <p className="text-xs text-pos-muted mt-0.5 truncate">{entry.detail}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-pos-muted">
                    {format(new Date(entry.timestamp), "MMM d")}
                  </p>
                  <p className="text-[10px] text-pos-muted">
                    {format(new Date(entry.timestamp), "h:mm a")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
