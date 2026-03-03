"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Search, RotateCcw, Loader2, X, Package,
  CheckCircle, AlertCircle,
} from "lucide-react"
import toast from "react-hot-toast"
import { getOrder, getOrders, createRefund } from "@/lib/medusa-client"
import { formatCurrency } from "@/lib/utils"
import { usePOSStore } from "@/lib/store"
import { hasPermission } from "@/lib/rbac"

export default function RefundsPage() {
  const router = useRouter()
  const store = usePOSStore()
  const currency = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "GHS"

  const [orderId, setOrderId] = useState("")
  const [order, setOrder] = useState<any>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem("pos_admin_token")) {
      router.push("/login")
      return
    }
    if (!hasPermission(store.staffRole, "pos.refund")) {
      toast.error("You don't have permission to access refunds")
      router.push("/")
    }
  }, [router, store.staffRole])

  // Load recent orders
  useEffect(() => {
    async function loadRecent() {
      try {
        setLoading(true)
        const data = await getOrders({ limit: 20 })
        setRecentOrders(data.orders || [])
      } catch {
        // non-critical
      } finally {
        setLoading(false)
      }
    }
    loadRecent()
  }, [])

  const lookupOrder = async () => {
    if (!orderId.trim()) return
    try {
      setSearching(true)
      const data = await getOrder(orderId.trim())
      if (data.order) {
        setOrder(data.order)
      } else {
        toast.error("Order not found")
      }
    } catch {
      toast.error("Order not found")
    } finally {
      setSearching(false)
    }
  }

  const selectOrder = async (id: string) => {
    try {
      setSearching(true)
      const data = await getOrder(id)
      if (data.order) {
        setOrder(data.order)
      }
    } catch {
      toast.error("Failed to load order")
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-pos-bg">
      <header className="h-14 bg-pos-card border-b border-pos-border flex items-center px-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="pos-btn-ghost">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-brand" />
            Refunds & Returns
          </h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Order Lookup */}
        <div className="pos-card p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Look up Order</h3>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pos-muted" />
              <input
                type="text"
                placeholder="Enter order ID..."
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookupOrder()}
                className="pos-input w-full pl-10"
                autoFocus
              />
            </div>
            <button onClick={lookupOrder} disabled={searching} className="pos-btn-primary">
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </button>
          </div>
        </div>

        {/* Selected Order Detail */}
        {order && (
          <div className="pos-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-pos-muted">Order</p>
                <p className="text-lg font-bold text-white font-mono">
                  #{order.display_id || order.id?.slice(0, 8)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-pos-muted">Total</p>
                <p className="text-lg font-bold text-brand">
                  {formatCurrency(order.total || 0, currency)}
                </p>
              </div>
            </div>

            <div className="border-t border-pos-border pt-3">
              <p className="text-xs text-pos-muted mb-2">Items</p>
              <div className="space-y-2">
                {(order.items || []).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between bg-pos-bg rounded-lg p-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-pos-card flex items-center justify-center">
                        <Package className="w-3.5 h-3.5 text-pos-muted" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">{item.title}</p>
                        <p className="text-[10px] text-pos-muted">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-white">
                      {formatCurrency(item.unit_price * item.quantity, currency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowRefundModal(true)}
                className="pos-btn-danger flex-1"
              >
                <RotateCcw className="w-4 h-4" /> Process Refund
              </button>
              <button
                onClick={() => setOrder(null)}
                className="pos-btn-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {!order && (
          <div className="pos-card p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Recent Orders</h3>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 text-brand animate-spin" />
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-center text-pos-muted text-sm py-8">No recent orders</p>
            ) : (
              <div className="space-y-1">
                {recentOrders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => selectOrder(o.id)}
                    className="w-full flex items-center justify-between bg-pos-bg rounded-lg p-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <div>
                      <p className="text-xs font-mono font-medium text-white">
                        #{o.display_id || o.id?.slice(0, 8)}
                      </p>
                      <p className="text-[10px] text-pos-muted">
                        {o.items?.length || 0} items · {new Date(o.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {formatCurrency(o.total || 0, currency)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {showRefundModal && order && (
        <RefundModal
          order={order}
          currency={currency}
          onClose={() => setShowRefundModal(false)}
          onRefunded={() => {
            setShowRefundModal(false)
            setOrder(null)
            toast.success("Refund processed successfully")
          }}
        />
      )}
    </div>
  )
}

function RefundModal({
  order,
  currency,
  onClose,
  onRefunded,
}: {
  order: any
  currency: string
  onClose: () => void
  onRefunded: () => void
}) {
  const store = usePOSStore()
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("customer_request")
  const [note, setNote] = useState("")
  const [processing, setProcessing] = useState(false)

  // Account for any previous refunds
  const previousRefunds = (order.refunds || []).reduce((sum: number, r: any) => sum + (r.amount || 0), 0)
  const maxRefund = Math.max(0, (order.total || 0) - previousRefunds)
  const refundAmount = Math.round((parseFloat(amount) || 0) * 100)

  const handleRefund = async () => {
    if (refundAmount <= 0) {
      toast.error("Enter a valid refund amount")
      return
    }
    if (refundAmount > maxRefund) {
      toast.error("Refund amount exceeds order total")
      return
    }

    try {
      setProcessing(true)
      await createRefund(order.id, {
        amount: refundAmount,
        reason,
        note: note || undefined,
      })
      store.addDrawerEntry({
        type: "refund",
        amount: refundAmount,
        note: `Refund for order #${order.display_id || order.id?.slice(0, 8)}`,
        order_id: order.id,
      })
      onRefunded()
    } catch (err: any) {
      toast.error(err.message || "Failed to process refund")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-pos-card border border-pos-border rounded-2xl w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-pos-border">
          <h2 className="text-lg font-bold text-white">Process Refund</h2>
          <button onClick={onClose} className="text-pos-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-pos-bg rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-pos-muted">Order</p>
              <p className="text-sm font-mono font-semibold text-white">
                #{order.display_id || order.id?.slice(0, 8)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-pos-muted">Max Refund</p>
              <p className="text-sm font-bold text-brand">
                {formatCurrency(maxRefund, currency)}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs text-pos-muted mb-1">Refund Amount *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pos-input w-full text-xl text-center h-14 font-bold"
              placeholder="0.00"
              step="0.01"
              max={maxRefund / 100}
              autoFocus
            />
            <button
              onClick={() => setAmount((maxRefund / 100).toFixed(2))}
              className="mt-2 pos-btn-secondary text-xs w-full"
            >
              Full Refund — {formatCurrency(maxRefund, currency)}
            </button>
          </div>

          <div>
            <label className="block text-xs text-pos-muted mb-1">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="pos-input w-full"
            >
              <option value="customer_request">Customer Request</option>
              <option value="defective_product">Defective Product</option>
              <option value="wrong_item">Wrong Item</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-pos-muted mb-1">Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="pos-input w-full h-20 resize-none"
              placeholder="Additional details..."
            />
          </div>

          {refundAmount > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="text-sm text-red-400 font-semibold">
                  Refund {formatCurrency(refundAmount, currency)}
                </p>
                <p className="text-xs text-red-400/70">This action cannot be undone</p>
              </div>
            </div>
          )}

          <button
            onClick={handleRefund}
            disabled={processing || refundAmount <= 0}
            className="pos-btn-danger w-full h-12 text-base font-bold"
          >
            {processing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <RotateCcw className="w-4 h-4" /> Confirm Refund
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
