"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Search, UserPlus, Users, X, Loader2, Phone, Mail,
  ChevronRight,
} from "lucide-react"
import toast from "react-hot-toast"
import { searchCustomers, createCustomer } from "@/lib/medusa-client"
import { usePOSStore } from "@/lib/store"
import { hasPermission, getRoleLabel } from "@/lib/rbac"
import { useAuditStore } from "@/lib/audit"
import { ThemeToggle } from "@/components/theme-toggle"

export default function CustomersPage() {
  const router = useRouter()
  const store = usePOSStore()

  const [query, setQuery] = useState("")
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const audit = useAuditStore()

  useEffect(() => {
    if (!localStorage.getItem("pos_admin_token")) {
      router.push("/login")
      return
    }
    if (!hasPermission(store.staffRole, "pos.customers")) {
      router.push("/")
    }
  }, [router, store.staffRole])

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setCustomers([])
      return
    }
    try {
      setLoading(true)
      const data = await searchCustomers(q)
      setCustomers(data.customers || [])
    } catch (err) {
      toast.error("Failed to search customers")
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  const selectCustomer = (customer: any) => {
    store.setCustomer(customer)
    toast.success(`Customer: ${customer.first_name} ${customer.last_name}`)
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-pos-bg">
      <header className="h-14 bg-pos-card border-b border-pos-border flex items-center justify-between px-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="pos-btn-ghost">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-bold text-pos-fg flex items-center gap-2">
            <Users className="w-5 h-5 text-brand" />
            Customers
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button onClick={() => setShowCreate(true)} className="pos-btn-primary text-xs">
            <UserPlus className="w-4 h-4" /> <span className="hidden sm:inline">New Customer</span><span className="sm:hidden">New</span>
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Current customer */}
        {store.customer && (
          <div className="pos-card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-pos-muted">Current customer</p>
              <p className="text-sm font-semibold text-pos-fg">
                {store.customer.first_name} {store.customer.last_name}
              </p>
              {store.customer.email && (
                <p className="text-xs text-pos-muted">{store.customer.email}</p>
              )}
            </div>
            <button
              onClick={() => {
                store.setCustomer(null)
                toast("Customer removed from sale")
              }}
              className="pos-btn-ghost text-xs text-red-600 dark:text-red-400"
            >
              <X className="w-4 h-4" /> Remove
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pos-muted" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pos-input-icon w-full"
            autoFocus
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
          </div>
        ) : customers.length > 0 ? (
          <div className="space-y-2">
            {customers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => selectCustomer(customer)}
                className="pos-card p-4 w-full text-left hover:border-brand/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand font-semibold text-sm">
                    {(customer.first_name?.[0] || "").toUpperCase()}
                    {(customer.last_name?.[0] || "").toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-pos-fg">
                      {customer.first_name} {customer.last_name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-pos-muted mt-0.5 flex-wrap">
                      {customer.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {customer.email}
                        </span>
                      )}
                      {customer.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {customer.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-pos-muted group-hover:text-pos-fg transition-colors" />
              </button>
            ))}
          </div>
        ) : query.trim() ? (
          <div className="text-center py-12 text-pos-muted">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No customers found</p>
            <button onClick={() => setShowCreate(true)} className="pos-btn-primary text-xs mt-3">
              <UserPlus className="w-3.5 h-3.5" /> Create Customer
            </button>
          </div>
        ) : (
          <div className="text-center py-12 text-pos-muted">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Search for a customer to attach to this sale</p>
          </div>
        )}
      </div>

      {/* Create Customer Modal */}
      {showCreate && (
        <CreateCustomerModal
          onClose={() => setShowCreate(false)}
          onCreated={(customer) => {
            selectCustomer(customer)
            setShowCreate(false)
          }}
        />
      )}
    </div>
  )
}

function CreateCustomerModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (customer: any) => void
}) {
  const store = usePOSStore()
  const audit = useAuditStore()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [saving, setSaving] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required")
      return
    }
    if (!email.trim()) {
      toast.error("Email is required")
      return
    }

    try {
      setSaving(true)
      const data = await createCustomer({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
      })
      audit.addEntry({
        action: "customer_create",
        staffName: store.staffName,
        staffRole: getRoleLabel(store.staffRole),
        detail: `Created customer: ${firstName} ${lastName} (${email})`,
      })
      toast.success("Customer created")
      onCreated(data.customer)
    } catch (err: any) {
      toast.error(err.message || "Failed to create customer")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-pos-card border border-pos-border rounded-2xl w-full max-w-md mx-4 shadow-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-pos-border">
          <h2 className="text-lg font-bold text-pos-fg">New Customer</h2>
          <button onClick={onClose} className="text-pos-muted hover:text-pos-fg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleCreate} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-pos-muted mb-1">First Name *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="pos-input w-full"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-pos-muted mb-1">Last Name *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="pos-input w-full"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-pos-muted mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pos-input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-pos-muted mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pos-input w-full"
              placeholder="+233..."
            />
          </div>
          <button type="submit" disabled={saving} className="pos-btn-primary w-full h-11">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Customer"}
          </button>
        </form>
      </div>
    </div>
  )
}
