"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, DollarSign, ShoppingCart, TrendingUp,
  BarChart3, Loader2, Package, PackageCheck, Tag, Download,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts"
import { getOrders, getProducts } from "@/lib/medusa-client"
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

  const [inventoryStats, setInventoryStats] = useState({
    productCount: 0,
    unitCount: 0,
    costPrice: 0,
    sellingPrice: 0,
  })
  const [loadingInventory, setLoadingInventory] = useState(true)

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

  // Fetch Inventory (Once)
  useEffect(() => {
    async function fetchInventory() {
      try {
        setLoadingInventory(true)
        // Fetch a large limit to aggregate all products
        const data = await getProducts({ limit: 1000 })
        const products = data.products || []
        
        let totalProductCount = 0
        let totalUnitCount = 0
        let totalCost = 0
        let totalSelling = 0

        const toAmount = (value: unknown) => {
          if (typeof value === "number") return value
          if (typeof value === "string") {
            const parsed = Number(value)
            return Number.isFinite(parsed) ? parsed : 0
          }
          return 0
        }

        products.forEach((p: any) => {
          const variants = p.variants || []
          const inStockVariants = variants.filter((v: any) => (v.inventory_quantity || 0) > 0)

          if (inStockVariants.length > 0) {
            totalProductCount += 1
          }

          inStockVariants.forEach((v: any) => {
            const qty = v.inventory_quantity || 0
            totalUnitCount += qty

            const priceObj = v.prices?.find(
              (pr: any) => pr.currency_code === currency.toLowerCase()
            )
            const sellingPrice = toAmount(priceObj?.amount)
            const costPrice =
              toAmount(v?.cost_price) ||
              toAmount(v?.metadata?.cost_price) ||
              toAmount(v?.metadata?.costPrice) ||
              toAmount(v?.metadata?.purchase_price) ||
              toAmount(v?.metadata?.purchasePrice)

            totalSelling += sellingPrice * qty
            totalCost += costPrice * qty
          })
        })

        setInventoryStats({
          productCount: totalProductCount,
          unitCount: totalUnitCount,
          costPrice: totalCost,
          sellingPrice: totalSelling,
        })

      } catch (err) {
        console.error("Failed to fetch inventory:", err)
      } finally {
        setLoadingInventory(false)
      }
    }
    if (hasPermission(store.staffRole, "pos.reports")) {
      fetchInventory()
    }
  }, [currency, store.staffRole])

  // ─── Computed Stats ──────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || o.summary?.current_order_total || 0), 0)
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
        hours[key] += o.total || o.summary?.current_order_total || 0
      }
    })
    return Object.entries(hours).map(([hour, amount]) => ({
      hour,
      amount: amount,
    }))
  }, [orders])

  // ─── Chart Data: Sales by Day ────────────────────────────────────────────

  const dailyData = useMemo(() => {
    if (period === "today") return []
    const days: Record<string, number> = {}
    orders.forEach((o) => {
      const day = format(parseISO(o.created_at), "MMM dd")
      days[day] = (days[day] || 0) + (o.total || o.summary?.current_order_total || 0)
    })
    return Object.entries(days).map(([day, amount]) => ({
      day,
      amount: amount,
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
      value: value,
    }))
  }, [orders])

  // ─── Cash Drawer Stats ───────────────────────────────────────────────────

  const drawerBalance = store.getDrawerBalance()
  const drawerEntries = store.drawerEntries

  const productSoldRows = useMemo(() => {
    const lines = new Map<
      string,
      { title: string; variant: string; sku: string; quantity: number; revenue: number }
    >()

    orders.forEach((order) => {
      ;(order.items || []).forEach((item: any) => {
        const title = item?.title || "Unknown item"
        const variant = item?.variant_title || "Default"
        const sku = item?.variant_sku || item?.sku || "N/A"
        const key = `${item?.variant_id || item?.id || title}-${sku}`
        const current = lines.get(key) || {
          title,
          variant,
          sku,
          quantity: 0,
          revenue: 0,
        }
        const quantity = item?.quantity || 0
        const lineTotal = item?.total ?? (item?.unit_price || 0) * quantity
        current.quantity += quantity
        current.revenue += lineTotal
        lines.set(key, current)
      })
    })

    return Array.from(lines.values()).sort((a, b) => b.quantity - a.quantity)
  }, [orders])

  // ─── Export CSV ──────────────────────────────────────────────────────────

  const handleExportCSV = () => {
    if (orders.length === 0) return

    const headers = ["Order ID", "Date", "Items Count", "Status", "Payment Method", "Total"]
    const rows = orders.map(order => [
      order.display_id || order.id?.slice(0, 8),
      format(parseISO(order.created_at), "yyyy-MM-dd HH:mm:ss"),
      order.items?.length || 0,
      order.status || "completed",
      order.payments?.[0]?.provider_id || "unknown",
      (order.total || order.summary?.current_order_total || 0)
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `letscase-orders-${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportProductSoldCSV = () => {
    if (productSoldRows.length === 0) return

    const headers = ["Product", "Variant", "SKU", "Quantity Sold", "Total Revenue"]
    const rows = productSoldRows.map((row) => [
      row.title,
      row.variant,
      row.sku,
      row.quantity,
      row.revenue,
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `letscase-product-sold-${format(new Date(), "yyyy-MM-dd")}.csv`
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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

            {/* Inventory Overview */}
            <div className="pos-card p-4">
              <h3 className="text-sm font-semibold text-pos-fg mb-4">Inventory Overview</h3>
              {loadingInventory ? (
                 <div className="flex items-center justify-center h-24">
                   <Loader2 className="w-6 h-6 text-brand animate-spin" />
                 </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-pos-bg rounded-lg p-4 border border-pos-border">
                    <p className="text-xs text-pos-muted flex items-center gap-2 mb-1">
                      <PackageCheck className="w-4 h-4 text-brand" /> Available Products
                    </p>
                    <p className="text-2xl font-bold text-pos-fg">{inventoryStats.productCount}</p>
                    <p className="text-[11px] text-pos-muted mt-1">
                      {inventoryStats.unitCount} total units in stock
                    </p>
                  </div>
                  <div className="bg-pos-bg rounded-lg p-4 border border-pos-border">
                    <p className="text-xs text-pos-muted flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-red-500" /> Total Cost Price
                    </p>
                    <p className="text-2xl font-bold text-pos-fg">
                      {formatCurrency(inventoryStats.costPrice, currency)}
                    </p>
                  </div>
                  <div className="bg-pos-bg rounded-lg p-4 border border-pos-border">
                    <p className="text-xs text-pos-muted flex items-center gap-2 mb-1">
                      <Tag className="w-4 h-4 text-emerald-500" /> Total Selling Price
                    </p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(inventoryStats.sellingPrice, currency)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="pos-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-pos-fg">Recent Orders</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportProductSoldCSV}
                    disabled={productSoldRows.length === 0}
                    className="pos-btn-secondary text-xs px-3 py-1.5 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Product Sold</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    disabled={orders.length === 0}
                    className="pos-btn-secondary text-xs px-3 py-1.5 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Orders CSV</span>
                  </button>
                </div>
              </div>

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
                          {formatCurrency(order.total || order.summary?.current_order_total || 0, currency)}
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
                        {formatCurrency(order.total || order.summary?.current_order_total || 0, currency)}
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
