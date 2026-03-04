"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Printer, DollarSign, TrendingUp, Clock,
  CreditCard, Loader2, CheckCircle,
} from "lucide-react"
import { usePOSStore } from "@/lib/store"
import { useAuditStore } from "@/lib/audit"
import { hasPermission, getRoleLabel } from "@/lib/rbac"
import { getOrders } from "@/lib/medusa-client"
import { formatCurrency } from "@/lib/utils"
import { useReactToPrint } from "react-to-print"
import { format } from "date-fns"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ShiftReportPage() {
  const router = useRouter()
  const store = usePOSStore()
  const audit = useAuditStore()
  const currency = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "GHS"
  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({ contentRef: printRef })

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cashCount, setCashCount] = useState("")
  const [shiftClosed, setShiftClosed] = useState(false)

  // Auth + RBAC
  useEffect(() => {
    if (!localStorage.getItem("pos_admin_token")) {
      router.push("/login")
      return
    }
    if (!hasPermission(store.staffRole, "pos.shift_report")) {
      router.push("/")
    }
  }, [router, store.staffRole])

  // Load orders for this shift
  useEffect(() => {
    async function loadShiftOrders() {
      if (!store.shiftStart) {
        setLoading(false)
        return
      }
      try {
        const data = await getOrders({
          limit: 200,
          created_at: { gte: store.shiftStart },
        })
        setOrders(data.orders || [])
      } catch {
        // non-critical
      } finally {
        setLoading(false)
      }
    }
    loadShiftOrders()
  }, [store.shiftStart])

  // Computed shift stats
  const stats = useMemo(() => {
    const posOrders = orders.filter(
      (o: any) => o.metadata?.source === "pos"
    )

    const totalSales = posOrders.reduce((s: number, o: any) => s + (o.total || 0), 0)
    const totalRefunds = posOrders.reduce(
      (s: number, o: any) =>
        s + (o.refunds || []).reduce((rs: number, r: any) => rs + (r.amount || 0), 0),
      0
    )

    // Sales by payment method
    const byMethod: Record<string, { count: number; total: number }> = {}
    posOrders.forEach((o: any) => {
      const method = o.metadata?.payment_method || "unknown"
      if (!byMethod[method]) byMethod[method] = { count: 0, total: 0 }
      byMethod[method].count++
      byMethod[method].total += o.total || 0
    })

    // Cash drawer
    const drawerBalance = store.getDrawerBalance()
    const cashSales = store.drawerEntries
      .filter((e) => e.type === "sale")
      .reduce((s, e) => s + e.amount, 0)
    const cashIns = store.drawerEntries
      .filter((e) => e.type === "cash_in" || e.type === "open")
      .reduce((s, e) => s + e.amount, 0)
    const cashOuts = store.drawerEntries
      .filter((e) => e.type === "cash_out" || e.type === "refund")
      .reduce((s, e) => s + e.amount, 0)

    return {
      orderCount: posOrders.length,
      totalSales,
      totalRefunds,
      netSales: totalSales - totalRefunds,
      byMethod,
      drawerBalance,
      cashSales,
      cashIns,
      cashOuts,
    }
  }, [orders, store])

  const handleCloseShift = () => {
    audit.addEntry({
      action: "shift_close",
      staffName: store.staffName,
      staffRole: getRoleLabel(store.staffRole),
      detail: `Shift closed. Sales: ${stats.orderCount}, Total: ${formatCurrency(stats.totalSales, currency)}, Drawer: ${formatCurrency(stats.drawerBalance, currency)}`,
      metadata: {
        orderCount: stats.orderCount,
        totalSales: stats.totalSales,
        drawerBalance: stats.drawerBalance,
        cashCount: Math.round((parseFloat(cashCount) || 0) * 100),
      },
    })
    store.endShift()
    store.clearDrawerEntries()
    setShiftClosed(true)
  }

  const shiftDuration = store.shiftStart
    ? Math.round((Date.now() - new Date(store.shiftStart).getTime()) / 60000)
    : 0
  const shiftHours = Math.floor(shiftDuration / 60)
  const shiftMins = shiftDuration % 60

  const actualCash = Math.round((parseFloat(cashCount) || 0) * 100)
  const expectedCash = stats.drawerBalance
  const cashDiff = actualCash - expectedCash

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pos-bg">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pos-bg">
      {/* Header */}
      <header className="h-14 bg-pos-card border-b border-pos-border flex items-center justify-between px-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="pos-btn-ghost">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-bold text-pos-fg">Shift Report (Z-Report)</h1>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button onClick={() => handlePrint()} className="pos-btn-primary text-xs">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Printable content */}
        <div ref={printRef} className="space-y-4 print:bg-white print:text-black print:p-8">
          {/* Shift Info */}
          <div className="pos-card p-4">
            <h2 className="text-sm font-semibold text-pos-muted mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Shift Info
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-pos-muted text-xs">Staff</p>
                <p className="text-pos-fg font-medium">{store.staffName || "—"}</p>
              </div>
              <div>
                <p className="text-pos-muted text-xs">Duration</p>
                <p className="text-pos-fg font-medium">
                  {store.shiftStart
                    ? `${shiftHours}h ${shiftMins}m`
                    : "No active shift"}
                </p>
              </div>
              <div>
                <p className="text-pos-muted text-xs">Shift Start</p>
                <p className="text-pos-fg font-medium">
                  {store.shiftStart
                    ? format(new Date(store.shiftStart), "MMM d, yyyy h:mm a")
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-pos-muted text-xs">Report Time</p>
                <p className="text-pos-fg font-medium">
                  {format(new Date(), "MMM d, yyyy h:mm a")}
                </p>
              </div>
            </div>
          </div>

          {/* Sales Summary */}
          <div className="pos-card p-4">
            <h2 className="text-sm font-semibold text-pos-muted mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Sales Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-pos-bg rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-brand">{stats.orderCount}</p>
                <p className="text-xs text-pos-muted">Transactions</p>
              </div>
              <div className="bg-pos-bg rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.totalSales, currency)}</p>
                <p className="text-xs text-pos-muted">Gross Sales</p>
              </div>
              <div className="bg-pos-bg rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(stats.totalRefunds, currency)}</p>
                <p className="text-xs text-pos-muted">Refunds</p>
              </div>
            </div>
            <div className="mt-3 bg-pos-bg rounded-lg p-3 flex justify-between items-center">
              <span className="text-sm font-medium text-pos-fg">Net Sales</span>
              <span className="text-lg font-bold text-brand">{formatCurrency(stats.netSales, currency)}</span>
            </div>
          </div>

          {/* Sales by Payment Method */}
          <div className="pos-card p-4">
            <h2 className="text-sm font-semibold text-pos-muted mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> By Payment Method
            </h2>
            {Object.keys(stats.byMethod).length === 0 ? (
              <p className="text-sm text-pos-muted text-center py-4">No sales this shift</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(stats.byMethod).map(([method, data]) => (
                  <div key={method} className="flex justify-between items-center bg-pos-bg rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-pos-fg capitalize">{method.replace(/_/g, " ")}</p>
                      <p className="text-xs text-pos-muted">{data.count} sale{data.count !== 1 ? "s" : ""}</p>
                    </div>
                    <p className="text-sm font-bold text-pos-fg">{formatCurrency(data.total, currency)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cash Drawer Reconciliation */}
          <div className="pos-card p-4">
            <h2 className="text-sm font-semibold text-pos-muted mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Cash Drawer
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-pos-muted">Cash In (Opening + Deposits)</span>
                <span className="text-pos-fg">{formatCurrency(stats.cashIns, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pos-muted">Cash Sales</span>
                <span className="text-emerald-600 dark:text-emerald-400">+{formatCurrency(stats.cashSales, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pos-muted">Cash Out (Withdrawals + Refunds)</span>
                <span className="text-red-600 dark:text-red-400">-{formatCurrency(stats.cashOuts, currency)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-pos-border font-bold">
                <span className="text-pos-fg">Expected in Drawer</span>
                <span className="text-brand">{formatCurrency(expectedCash, currency)}</span>
              </div>
            </div>

            {!shiftClosed && (
              <div className="mt-4">
                <label className="block text-xs text-pos-muted mb-1">Actual Cash Count</label>
                <input
                  type="number"
                  value={cashCount}
                  onChange={(e) => setCashCount(e.target.value)}
                  className="pos-input w-full text-center text-lg font-bold h-12"
                  placeholder="0.00"
                  step="0.01"
                />
                {actualCash > 0 && (
                  <div className={`mt-2 rounded-lg p-3 text-center ${
                    cashDiff === 0
                      ? "bg-emerald-500/10 border border-emerald-500/30"
                      : cashDiff > 0
                      ? "bg-amber-500/10 border border-amber-500/30"
                      : "bg-red-500/10 border border-red-500/30"
                  }`}>
                    <p className={`text-xs ${cashDiff === 0 ? "text-emerald-600 dark:text-emerald-400" : cashDiff > 0 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                      {cashDiff === 0
                        ? "Perfect balance!"
                        : cashDiff > 0
                        ? `Overage: +${formatCurrency(cashDiff, currency)}`
                        : `Shortage: ${formatCurrency(cashDiff, currency)}`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Close Shift Button */}
        {!shiftClosed && store.shiftStart && (
          <button
            onClick={handleCloseShift}
            className="pos-btn-danger w-full h-12 text-base font-bold"
          >
            Close Shift & Generate Z-Report
          </button>
        )}

        {shiftClosed && (
          <div className="pos-card p-6 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-pos-fg mb-1">Shift Closed</h3>
            <p className="text-sm text-pos-muted">
              Z-Report has been generated. You can print it using the button above.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
