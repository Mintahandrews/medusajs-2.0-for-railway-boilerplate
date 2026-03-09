"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Search, Loader2, Package, ChevronRight,
  DollarSign, Calendar, Filter, X,
} from "lucide-react"
import { getOrders } from "@/lib/medusa-client"
import { formatCurrency } from "@/lib/utils"
import { usePOSStore } from "@/lib/store"
import { hasPermission } from "@/lib/rbac"
import { 
  format,
  startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth
} from "date-fns"
import { ThemeToggle } from "@/components/theme-toggle"

type FilterPeriod = "all" | "today" | "week" | "month" | "custom"

export default function TransactionsPage() {
  const router = useRouter()
  const store = usePOSStore()
  const currency = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "GHS"

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [period, setPeriod] = useState<FilterPeriod>("all")
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const canViewAll = hasPermission(store.staffRole, "pos.transactions.all")

  // Auth + RBAC
  useEffect(() => {
    if (!localStorage.getItem("pos_admin_token")) {
      router.push("/login")
      return
    }
    if (!hasPermission(store.staffRole, "pos.transactions")) {
      router.push("/")
    }
  }, [router, store.staffRole])

  // Date ranges
  const dateRange = useMemo(() => {
    const now = new Date()
    switch (period) {
      case "today":
        return { gte: startOfDay(now).toISOString(), lte: endOfDay(now).toISOString() }
      case "week":
        return { gte: startOfWeek(now).toISOString(), lte: endOfWeek(now).toISOString() }
      case "month":
        return { gte: startOfMonth(now).toISOString(), lte: endOfMonth(now).toISOString() }
      case "custom": {
        if (!customFrom && !customTo) {
          return undefined
        }
        const gte = customFrom
          ? startOfDay(new Date(customFrom)).toISOString()
          : undefined
        const lte = customTo
          ? endOfDay(new Date(customTo)).toISOString()
          : undefined
        return gte || lte ? { gte, lte } : undefined
      }
      default:
        return undefined
    }
  }, [period, customFrom, customTo])

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getOrders({ 
        limit: 100,
        // Optional date filtering based on the toggle
        ...(dateRange ? { created_at: dateRange } : {})
      })
      let filtered = (data.orders || []).filter(
        (o: any) => o.metadata?.source === "pos"
      )
      // Cashiers can only see their own transactions
      if (!canViewAll && store.staffEmail) {
        filtered = filtered.filter(
          (o: any) => o.metadata?.staff === store.staffName
        )
      }
      setOrders(filtered)
    } catch {
      // non-critical
    } finally {
      setLoading(false)
    }
  }, [canViewAll, store.staffName, store.staffEmail, dateRange])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Filter orders
  const displayed = orders.filter((o: any) => {
    if (methodFilter !== "all" && o.metadata?.payment_method !== methodFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const id = (o.display_id || o.id || "").toString().toLowerCase()
      const email = (o.email || "").toLowerCase()
      const staff = (o.metadata?.staff || "").toLowerCase()
      if (!id.includes(q) && !email.includes(q) && !staff.includes(q)) return false
    }
    return true
  })

  const paymentMethods = Array.from(
    new Set(orders.map((o: any) => o.metadata?.payment_method).filter(Boolean))
  )

  return (
    <div className="min-h-screen bg-pos-bg">
      {/* Header */}
      <header className="h-14 bg-pos-card border-b border-pos-border flex items-center justify-between px-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="pos-btn-ghost">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-bold text-pos-fg">Transaction History</h1>
          <span className="text-xs text-pos-muted">({displayed.length} orders)</span>
        </div>
        <ThemeToggle />
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pos-muted" />
            <input
              type="text"
              placeholder="Search by order ID, email, or staff..."
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
            <button
              onClick={() => setMethodFilter("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                methodFilter === "all" ? "bg-brand text-white" : "text-pos-muted hover:text-pos-fg"
              }`}
            >
              All
            </button>
            {paymentMethods.map((m: string) => (
              <button
                key={m}
                onClick={() => setMethodFilter(m)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize whitespace-nowrap ${
                  methodFilter === m ? "bg-brand text-white" : "text-pos-muted hover:text-pos-fg"
                }`}
              >
                {m.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <div className="flex bg-pos-card rounded-lg p-0.5 border border-pos-border overflow-x-auto scrollbar-none">
            {(["all", "today", "week", "month", "custom"] as FilterPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  period === p
                    ? "bg-brand text-white"
                    : "text-pos-muted hover:text-pos-fg"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {period === "custom" && (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="pos-input h-9 text-xs"
              />
              <span className="text-xs text-pos-muted">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="pos-input h-9 text-xs"
              />
              {(customFrom || customTo) && (
                <button
                  onClick={() => {
                    setCustomFrom("")
                    setCustomTo("")
                  }}
                  className="pos-btn-ghost text-xs px-2.5 py-1.5"
                >
                  Clear dates
                </button>
              )}
            </div>
          )}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-12 text-pos-muted">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayed.map((order: any) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                className="w-full pos-card p-3 hover-subtle transition-colors text-left"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-brand" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-pos-fg">
                        #{order.display_id || order.id?.slice(-6)}
                      </p>
                      <p className="text-xs text-pos-muted flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(order.created_at), "MMM d, h:mm a")}
                        {order.metadata?.staff && (
                          <span> · {order.metadata.staff}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-pos-fg">
                        {formatCurrency(order.total || 0, currency)}
                      </p>
                      <p className="text-[10px] text-pos-muted capitalize">
                        {(order.metadata?.payment_method || "").replace(/_/g, " ")}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-pos-muted transition-transform ${
                      selectedOrder?.id === order.id ? "rotate-90" : ""
                    }`} />
                  </div>
                </div>

                {/* Expanded details */}
                {selectedOrder?.id === order.id && (
                  <div className="mt-3 pt-3 border-t border-pos-border space-y-2" onClick={(e) => e.stopPropagation()}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-pos-muted">Customer:</span>{" "}
                        <span className="text-pos-fg">{order.email || "Walk-in"}</span>
                      </div>
                      <div>
                        <span className="text-pos-muted">Status:</span>{" "}
                        <span className="text-emerald-600 dark:text-emerald-400 capitalize">{order.status || "completed"}</span>
                      </div>
                      {order.metadata?.payment_method && (
                        <div>
                          <span className="text-pos-muted">Payment:</span>{" "}
                          <span className="text-pos-fg capitalize">{order.metadata.payment_method.replace(/_/g, " ")}</span>
                        </div>
                      )}
                      {order.metadata?.paystack_reference && (
                        <div>
                          <span className="text-pos-muted">Ref:</span>{" "}
                          <span className="text-pos-fg font-mono text-[10px]">{order.metadata.paystack_reference}</span>
                        </div>
                      )}
                    </div>
                    {order.items?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-pos-muted font-semibold">Items:</p>
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-pos-fg">
                              {item.title} × {item.quantity}
                            </span>
                            <span className="text-pos-muted">
                              {formatCurrency((item.unit_price || 0) * (item.quantity || 1), currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {(order.refunds?.length || 0) > 0 && (
                      <div className="bg-red-500/10 rounded-lg p-2">
                        <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                          Refunds: {formatCurrency(
                            order.refunds.reduce((s: number, r: any) => s + (r.amount || 0), 0),
                            currency
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
