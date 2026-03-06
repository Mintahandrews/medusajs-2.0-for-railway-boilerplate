"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Loader2, Search, X, UserCog, Shield,
  Key, Save, ChevronDown, Eye, EyeOff, Mail,
  Check, AlertTriangle, Send, Plus,
} from "lucide-react"
import { getAdminUsers, updateAdminUser, inviteStaffWithRole } from "@/lib/medusa-client"
import { usePOSStore } from "@/lib/store"
import { useAuditStore } from "@/lib/audit"
import {
  hasPermission, extractRoleFromUser, extractPinFromUser,
  getRoleLabel, getRoleBadgeClasses, getRoleColor,
  ALL_ROLES, getPermissions,
  type POSRole, type POSPermission,
} from "@/lib/rbac"
import toast from "react-hot-toast"
import { ThemeToggle } from "@/components/theme-toggle"

interface StaffMember {
  id: string
  email: string
  name: string
  role: POSRole
  pin: string | null
  raw: any
}

const PERMISSION_LABELS: Record<POSPermission, string> = {
  "pos.sell": "Ring up sales",
  "pos.discount.item_small": "Item discount ≤10%",
  "pos.discount.item_large": "Item discount >10%",
  "pos.discount.cart": "Cart-wide discount",
  "pos.refund": "Process refunds",
  "pos.void_sale": "Void/cancel sales",
  "pos.reports": "View reports",
  "pos.transactions": "View own transactions",
  "pos.transactions.all": "View all transactions",
  "pos.drawer.open": "Open cash drawer",
  "pos.customers": "Manage customers",
  "pos.hold_sale": "Hold/restore sales",
  "pos.audit_log": "View audit log",
  "pos.settings": "POS settings",
  "pos.manage_staff": "Manage staff",
  "pos.shift_report": "Shift/Z-Report",
}

export default function StaffPage() {
  const router = useRouter()
  const store = usePOSStore()
  const audit = useAuditStore()

  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<POSRole>("cashier")
  const [editPin, setEditPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [saving, setSaving] = useState(false)
  const [viewPermsRole, setViewPermsRole] = useState<POSRole | null>(null)

  // Invite form state
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<POSRole>("cashier")
  const [invitePin, setInvitePin] = useState("")
  const [inviting, setInviting] = useState(false)

  // Auth + RBAC guard
  useEffect(() => {
    if (!localStorage.getItem("pos_admin_token")) {
      router.push("/login")
      return
    }
    if (!hasPermission(store.staffRole, "pos.manage_staff")) {
      toast.error("You don't have permission to manage staff")
      router.push("/")
    }
  }, [router, store.staffRole])

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAdminUsers()
      const members: StaffMember[] = (data.users || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        name: [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email,
        role: extractRoleFromUser(u),
        pin: extractPinFromUser(u),
        raw: u,
      }))
      setStaff(members)
    } catch {
      toast.error("Failed to load staff")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  const startEdit = (member: StaffMember) => {
    setEditingId(member.id)
    setEditRole(member.role)
    setEditPin(member.pin || "")
    setShowPin(false)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditRole("cashier")
    setEditPin("")
    setShowPin(false)
  }

  const saveEdit = async (member: StaffMember) => {
    // Validate PIN
    if (editPin && (editPin.length < 4 || editPin.length > 6 || !/^\d+$/.test(editPin))) {
      toast.error("PIN must be 4-6 digits")
      return
    }

    // Prevent self-demotion
    if (member.id === store.staffUserId && editRole !== "admin") {
      toast.error("You cannot change your own role")
      return
    }

    try {
      setSaving(true)
      const newMetadata = {
        ...member.raw.metadata,
        pos_role: editRole,
        pos_pin: editPin || undefined,
      }
      // Remove pin key if empty
      if (!editPin) delete newMetadata.pos_pin

      await updateAdminUser(member.id, { metadata: newMetadata })

      audit.addEntry({
        action: "role_change",
        staffName: store.staffName,
        staffRole: getRoleLabel(store.staffRole),
        detail: `Changed ${member.name} role to ${getRoleLabel(editRole)}${editPin ? " + set PIN" : ""}`,
      })

      toast.success(`Updated ${member.name}`)
      cancelEdit()
      await fetchStaff()
    } catch {
      toast.error("Failed to update staff member")
    } finally {
      setSaving(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error("Email is required")
      return
    }
    if (invitePin && (invitePin.length < 4 || !/^\d+$/.test(invitePin))) {
      toast.error("PIN must be 4-6 digits")
      return
    }
    try {
      setInviting(true)
      await inviteStaffWithRole({
        email: inviteEmail,
        pos_role: inviteRole,
        ...(invitePin ? { pos_pin: invitePin } : {}),
      })
      audit.addEntry({
        action: "role_change",
        staffName: store.staffName,
        staffRole: getRoleLabel(store.staffRole),
        detail: `Invited ${inviteEmail} as ${getRoleLabel(inviteRole)}`,
      })
      toast.success(`Invite sent to ${inviteEmail} as ${getRoleLabel(inviteRole)}`)
      setInviteEmail("")
      setInvitePin("")
      setInviteRole("cashier")
      setShowInvite(false)
    } catch (err: any) {
      toast.error(err?.message || "Failed to send invite")
    } finally {
      setInviting(false)
    }
  }

  const displayed = staff.filter((m) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      getRoleLabel(m.role).toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-pos-bg">
      {/* Header */}
      <header className="h-14 bg-pos-card border-b border-pos-border flex items-center justify-between px-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="pos-btn-ghost">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <UserCog className="w-5 h-5 text-brand" />
          <h1 className="text-lg font-bold text-pos-fg">Staff Management</h1>
          <span className="text-xs text-pos-muted">({staff.length} members)</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="pos-btn-primary text-xs"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Invite Staff</span><span className="sm:hidden">Invite</span>
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Invite Form */}
        {showInvite && (
          <div className="pos-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-pos-fg flex items-center gap-2">
                <Send className="w-4 h-4 text-brand" /> Invite New Staff
              </h3>
              <button onClick={() => setShowInvite(false)} className="text-pos-muted hover:text-pos-fg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-pos-muted font-medium mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pos-muted" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="staff@letscase.com"
                    className="pos-input-icon w-full"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-pos-muted font-medium mb-1 block">POS Role</label>
                <div className="flex gap-1.5">
                  {ALL_ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => setInviteRole(role)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                        inviteRole === role
                          ? role === "admin"
                            ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/40"
                            : role === "manager"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40"
                              : "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/40"
                          : "bg-pos-card text-pos-muted border-pos-border hover-subtle"
                      }`}
                    >
                      {getRoleLabel(role)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="w-40">
                <label className="text-xs text-pos-muted font-medium mb-1 block">PIN <span className="opacity-50">(optional)</span></label>
                <input
                  type="text"
                  value={invitePin}
                  onChange={(e) => setInvitePin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="4-6 digits"
                  className="pos-input w-full font-mono tracking-widest"
                  maxLength={6}
                />
              </div>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail}
                className="pos-btn-primary text-xs flex-1"
              >
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {inviting ? "Sending..." : "Send Invite"}
              </button>
            </div>
            <p className="text-[11px] text-pos-muted">
              An email invite will be sent. When accepted, the role and PIN are auto-assigned.
              They&apos;ll have access to both the POS and Medusa admin based on their role.
            </p>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pos-muted" />
          <input
            type="text"
            placeholder="Search staff by name, email, or role..."
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

        {/* Staff List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-12 text-pos-muted">
            <UserCog className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No staff members found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((member) => {
              const isEditing = editingId === member.id
              const isSelf = member.id === store.staffUserId

              return (
                <div key={member.id} className="pos-card overflow-hidden">
                  {/* Main row */}
                  <div className="p-4 flex items-center gap-3 sm:gap-4">
                    {/* Avatar */}
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-base sm:text-lg font-bold shrink-0 ${
                      member.role === "admin"
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : member.role === "manager"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                    }`}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-pos-fg truncate">{member.name}</p>
                        {isSelf && (
                          <span className="text-[10px] bg-brand/10 text-brand px-1.5 py-0.5 rounded-full font-medium">
                            You
                          </span>
                        )}
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${getRoleBadgeClasses(member.role)}`}>
                          {getRoleLabel(member.role)}
                        </span>
                      </div>
                      <p className="text-xs text-pos-muted flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 shrink-0" /> {member.email}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {member.pin && (
                        <span className="text-[10px] text-pos-muted flex items-center gap-0.5 hidden sm:flex">
                          <Key className="w-3 h-3" /> PIN
                        </span>
                      )}
                      {!isEditing && (
                        <button
                          onClick={() => startEdit(member)}
                          className="pos-btn-ghost text-xs px-2 py-1"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Edit panel */}
                  {isEditing && (
                    <div className="border-t border-pos-border bg-pos-bg-subtle p-4 space-y-4">
                      {isSelf && (
                        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-lg p-2.5">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>You cannot change your own role. You can update your PIN.</span>
                        </div>
                      )}

                      {/* Role selector */}
                      <div>
                        <label className="text-xs text-pos-muted font-medium mb-1.5 block">POS Role</label>
                        <div className="flex gap-2">
                          {ALL_ROLES.map((role) => (
                            <button
                              key={role}
                              onClick={() => {
                                if (!isSelf) setEditRole(role)
                              }}
                              disabled={isSelf}
                              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                                editRole === role
                                  ? role === "admin"
                                    ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/40"
                                    : role === "manager"
                                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40"
                                      : "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/40"
                                  : "bg-pos-card text-pos-muted border-pos-border hover-subtle"
                              } ${isSelf ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              {getRoleLabel(role)}
                            </button>
                          ))}
                        </div>
                        {/* Permission preview */}
                        <button
                          onClick={() => setViewPermsRole(viewPermsRole === editRole ? null : editRole)}
                          className="text-[11px] text-brand hover:underline mt-1.5 flex items-center gap-1"
                        >
                          <Shield className="w-3 h-3" />
                          {viewPermsRole === editRole ? "Hide" : "View"} {getRoleLabel(editRole)} permissions
                          <ChevronDown className={`w-3 h-3 transition-transform ${viewPermsRole === editRole ? "rotate-180" : ""}`} />
                        </button>
                        {viewPermsRole === editRole && (
                          <div className="mt-2 bg-pos-bg rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {(Object.keys(PERMISSION_LABELS) as POSPermission[]).map((perm) => {
                              const has = getPermissions(editRole).includes(perm)
                              return (
                                <div key={perm} className="flex items-center gap-1.5 text-[11px]">
                                  {has ? (
                                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                  ) : (
                                    <X className="w-3 h-3 text-red-600 dark:text-red-400 opacity-50 shrink-0" />
                                  )}
                                  <span className={has ? "text-pos-fg" : "text-pos-muted opacity-50"}>
                                    {PERMISSION_LABELS[perm]}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* PIN input */}
                      <div>
                        <label className="text-xs text-pos-muted font-medium mb-1.5 block">
                          Quick Login PIN <span className="text-pos-muted opacity-50">(optional, 4-6 digits)</span>
                        </label>
                        <div className="relative max-w-[200px]">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pos-muted" />
                          <input
                            type={showPin ? "text" : "password"}
                            value={editPin}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, "").slice(0, 6)
                              setEditPin(v)
                            }}
                            placeholder="e.g. 1234"
                            className="pos-input-icon w-full pr-10 font-mono tracking-widest"
                            maxLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPin(!showPin)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-pos-muted hover:text-pos-fg"
                          >
                            {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {editPin && (editPin.length < 4) && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">PIN must be at least 4 digits</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="pos-btn-secondary text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(member)}
                          disabled={saving || (editPin.length > 0 && editPin.length < 4)}
                          className="pos-btn-primary text-xs"
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Role Legend */}
        <div className="pos-card p-4">
          <h3 className="text-xs font-semibold text-pos-muted uppercase tracking-wider mb-3">Role Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ALL_ROLES.map((role) => {
              const perms = getPermissions(role)
              return (
                <div key={role} className={`rounded-lg border p-3 ${getRoleBadgeClasses(role)}`}>
                  <p className="text-sm font-bold">{getRoleLabel(role)}</p>
                  <p className="text-[11px] opacity-70 mt-0.5">
                    {perms.length} permission{perms.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
