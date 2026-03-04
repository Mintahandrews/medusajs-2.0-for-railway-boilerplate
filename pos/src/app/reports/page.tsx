"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, DollarSign, ShoppingCart, TrendingUp,
  BarChart3, Loader2, Package,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts"
import { getOrders } from "@/lib/medusa-client"
import { formatCurrency } from "@/lib/utils"
import { usePOSStore } from "@/lib/store"
import { ThemeToggle } from "@/components/theme-toggle"
import { useThemeStore } from "@/lib/theme"
import { hasPermission } from "@/lib/rbac"
import {
  startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  subDays, format, parseISO,
} from "date-fns"

// ─── Types ───────────────────────────────────────────────────────────────────

type FilterPeriod = "today" | "week" | "month" | "custom"

const CHART_COLORS = ["#14b8a6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

const CHART_THEME = {
  dark: { grid: "#27272a", tick: "#71717a", tooltipBg: "#18181b", tooltipBorder: "#27272a", tooltipFg: "#fafafa" },
  light: { grid: "#e5e7eb", tick: "#6b7280", tooltipBg: "#ffffff", tooltipBorder: "#e5e7eb", tooltipFg: "#111827" },
}

// ─── Reports Page ────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const router = useRouter()
  const store = usePOSStore()
  const currency = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "GHS"
  const ct = CHART_THEME[useThemeStore((s) => s.theme)]

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<FilterPeriod>("today")

  // Auth + RBAC check
  useEffect(() => {
    if (!localStorage.getItem("pos_admin_token")) {
      router.push("/login")
      return
    }
    if (!hasPermission(store.staffRole, "pos.reports")) {
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
      default:
        return { gte: subDays(now, 30).toISOString(), lte: now.toISOString() }
    }
  }, [period])

  // Fetch orders
  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        const data = await getOrders({
          limit: 200,
          created_at: dateRange,
        })
        setOrders(data.orders || [])
      } catch (err) {
        console.error("Failed to fetch orders:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [dateRange])

  // ─── Computed Stats ──────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
    const totalOrders = orders.length
    const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0
    const totalItems = orders.reduce(
      (sum, o) => sum + (o.items?.reduce((s: number, i: any) => s + (i.quantity || 0), 0) || 0),
      0
    )

    return { totalRevenue, totalOrders, avgOrderValue, totalItems }
  }, [orders])

  // ─── Chart Data: Sales by Hour ───────────────────────────────────────────

  const hourlyData = useMemo(() => {
    const hours: Record<string, number> = {}
    for (let h = 8; h <= 20; h++) {
      hours[`${h}:00`] = 0
    }
    orders.forEach((o) => {
      const hour = new Date(o.created_at).getHours()
      const key = `${hour}:00`
      if (hours[key] !== undefined) {
        hours[key] += o.total || 0
      }
    })
    return Object.entries(hours).map(([hour, amount]) => ({
      hour,
      amount: amount / 100,
    }))
  }, [orders])

  // ─── Chart Data: Sales by Day ────────────────────────────────────────────

  const dailyData = useMemo(() => {
    if (period === "today") return []
    const days: Record<string, number> = {}
    orders.forEach((o) => {
      const day = format(parseISO(o.created_at), "MMM dd")
      days[day] = (days[day] || 0) + (o.total || 0)
    })
    return Object.entries(days).map(([day, amount]) => ({
      day,
      amount: amount / 100,
    }))
  }, [orders, period])

  // ─── Chart Data: Payment Methods ─────────────────────────────────────────

  const paymentData = useMemo(() => {
    const methods: Record<string, number> = {}
    orders.forEach((o) => {
      const payments = o.payments || []
      payments.forEach((p: any) => {
        const method = p.provider_id || "unknown"
        methods[method] = (methods[method] || 0) + (p.amount || 0)
      })
    })
    return Object.entries(methods).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value / 100,
    }))
  }, [orders])

  // ─── Cash Drawer Stats ───────────────────────────────────────────────────

  const drawerBalance = store.getDrawerBalance()
  const drawerEntries = store.drawerEntries

  return (
    <div className="min-h-screen bg-pos-bg">
      {/* Header */}
      <header className="h-14 bg-pos-card border-b border-pos-border flex items-center justify-between px-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="pos-btn-ghost">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-bold text-pos-fg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand" />
            Reports & Analytics
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* Period Filter */}
          <div className="flex bg-pos-bg rounded-lg p-0.5 border border-pos-border">
            {(["today", "week", "month"] as FilterPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  period === p
                    ? "bg-brand text-white"
                    : "text-pos-muted hover:text-pos-fg"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                label="Total Revenue"
                value={formatCurrency(stats.totalRevenue, currency)}
                icon={<DollarSign className="w-5 h-5" />}
                color="text-emerald-600 dark:text-emerald-400"
                bgColor="bg-emerald-500/10"
              />
              <StatCard
                label="Total Orders"
                value={String(stats.totalOrders)}
                icon={<ShoppingCart className="w-5 h-5" />}
                color="text-teal-600 dark:text-teal-400"
                bgColor="bg-teal-500/10"
              />
              <StatCard
                label="Avg. Order Value"
                value={formatCurrency(stats.avgOrderValue, currency)}
                icon={<TrendingUp className="w-5 h-5" />}
                color="text-purple-600 dark:text-purple-400"
                bgColor="bg-purple-500/10"
              />
              <StatCard
                label="Items Sold"
                value={String(stats.totalItems)}
                icon={<Package className="w-5 h-5" />}
                color="text-orange-600 dark:text-orange-400"
                bgColor="bg-orange-500/10"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Sales by Hour */}
              {period === "today" && hourlyData.length > 0 && (
                <div className="pos-card p-4">
                  <h3 className="text-sm font-semibold text-pos-fg mb-4">Sales by Hour</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
                        <XAxis dataKey="hour" tick={{ fill: ct.tick, fontSize: 11 }} />
                        <YAxis tick={{ fill: ct.tick, fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: ct.tooltipBg, border: `1px solid ${ct.tooltipBorder}`, borderRadius: 8, color: ct.tooltipFg }}
                        />
                        <Bar dataKey="amount" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Sales by Day */}
              {period !== "today" && dailyData.length > 0 && (
                <div className="pos-card p-4">
                  <h3 className="text-sm font-semibold text-pos-fg mb-4">Daily Sales</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
                        <XAxis dataKey="day" tick={{ fill: ct.tick, fontSize: 11 }} />
                        <YAxis tick={{ fill: ct.tick, fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: ct.tooltipBg, border: `1px solid ${ct.tooltipBorder}`, borderRadius: 8, color: ct.tooltipFg }}
                        />
                        <Line type="monotone" dataKey="amount" stroke="#14b8a6" strokeWidth={2} dot={{ fill: "#14b8a6" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Payment Methods Pie */}
              {paymentData.length > 0 && (
                <div className="pos-card p-4">
                  <h3 className="text-sm font-semibold text-pos-fg mb-4">Payment Methods</h3>
                  <div className="h-64 flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={{ stroke: ct.tick }}
                        >
                          {paymentData.map((_, index) => (
                            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: ct.tooltipBg, border: `1px solid ${ct.tooltipBorder}`, borderRadius: 8, color: ct.tooltipFg }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Cash Drawer Summary */}
              <div className="pos-card p-4">
                <h3 className="text-sm font-semibold text-pos-fg mb-4">Cash Drawer</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-pos-muted">Current Balance</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(drawerBalance, currency)}
                    </span>
                  </div>
                  <div className="border-t border-pos-border pt-3 space-y-2 max-h-40 overflow-y-auto">
                    {drawerEntries.length === 0 ? (
                      <p className="text-xs text-pos-muted text-center py-4">No drawer entries</p>
                    ) : (
                      drawerEntries.slice(-10).reverse().map((entry) => (
                        <div key={entry.id} className="flex justify-between text-xs">
                          <div>
                            <span className={`font-medium ${
                              entry.type === "sale" || entry.type === "cash_in" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                            }`}>
                              {entry.type.replace("_", " ").toUpperCase()}
                            </span>
                            {entry.note && <span className="text-pos-muted ml-2">{entry.note}</span>}
                          </div>
                          <span className={
                            entry.type === "sale" || entry.type === "cash_in" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                          }>
                            {entry.type === "sale" || entry.type === "cash_in" ? "+" : "-"}
                            {formatCurrency(entry.amount, currency)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="pos-card p-4">
              <h3 className="text-sm font-semibold text-pos-fg mb-4">Recent Orders</h3>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-pos-border text-left">
                      <th className="pb-2 text-pos-muted font-medium">Order</th>
                      <th className="pb-2 text-pos-muted font-medium">Date</th>
                      <th className="pb-2 text-pos-muted font-medium">Items</th>
                      <th className="pb-2 text-pos-muted font-medium">Status</th>
                      <th className="pb-2 text-pos-muted font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 20).map((order) => (
                      <tr key={order.id} className="border-b border-pos-border hover:bg-pos-surface">
                        <td className="py-2.5 text-pos-fg font-mono text-xs">
                          {order.display_id || order.id?.slice(0, 8)}
                        </td>
                        <td className="py-2.5 text-pos-muted">
                          {format(parseISO(order.created_at), "MMM dd, HH:mm")}
                        </td>
                        <td className="py-2.5 text-pos-muted">
                          {order.items?.length || 0} items
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            order.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              : order.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                              : "bg-pos-surface text-pos-muted"
                          }`}>
                            {order.status || "N/A"}
                          </span>
                        </td>
                        <td className="py-2.5 text-pos-fg font-semibold text-right">
                          {formatCurrency(order.total || 0, currency)}
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-pos-muted">
                          No orders found for this period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden space-y-2">
                {orders.length === 0 ? (
                  <p className="py-8 text-center text-pos-muted text-sm">No orders found for this period</p>
                ) : (
                  orders.slice(0, 20).map((order) => (
                    <div key={order.id} className="bg-pos-bg rounded-lg p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-medium text-pos-fg">
                            #{order.display_id || order.id?.slice(0, 8)}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                            order.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              : order.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                              : "bg-pos-surface text-pos-muted"
                          }`}>
                            {order.status || "N/A"}
                          </span>
                        </div>
                        <p className="text-[10px] text-pos-muted mt-0.5">
                          {format(parseISO(order.created_at), "MMM dd, HH:mm")} · {order.items?.length || 0} items
                        </p>
                      </div>
                      <p className="text-sm font-bold text-pos-fg shrink-0">
                        {formatCurrency(order.total || 0, currency)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
  bgColor,
}: {
  label: string
  value: string
  icon: React.ReactNode
  color: string
  bgColor: string
}) {
  return (
    <div className="pos-card p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-pos-muted">{label}</p>
          <p className="text-lg font-bold text-pos-fg">{value}</p>
        </div>
      </div>
    </div>
  )
}
