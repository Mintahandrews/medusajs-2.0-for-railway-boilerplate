"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Search, Plus, Minus, Trash2, ShoppingCart, DollarSign,
  Smartphone, Tag, MessageSquare, Pause, RotateCcw, Users,
  BarChart3, LogOut, ScanBarcode, Package, Shield, ClipboardList,
  X, Loader2, Receipt, Printer, Clock, UserCheck, UserCog,
  RefreshCw, MoreHorizontal, BookOpen,
} from "lucide-react"
import toast from "react-hot-toast"
import { usePOSStore, type POSCartItem, type POSState } from "@/lib/store"
import { getProducts, getCategories, getProductByBarcode, createDraftOrder, markDraftOrderPaid, getRegions, getShippingOptions } from "@/lib/medusa-client"
import { hasPermission, getRoleBadgeClasses, getRoleLabel } from "@/lib/rbac"
import { useAuditStore } from "@/lib/audit"
import { formatCurrency, playBeep } from "@/lib/utils"
import ReceiptPrint, { type ReceiptData } from "@/components/receipt"
import { useReactToPrint } from "react-to-print"
import { ThemeToggle } from "@/components/theme-toggle"

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProductVariant {
  id: string
  title: string
  barcode: string | null
  sku: string | null
  inventory_quantity: number | null
  prices: Array<{ amount: number; currency_code: string }>
}

interface Product {
  id: string
  title: string
  thumbnail: string | null
  variants: ProductVariant[]
  collection?: { title: string } | null
  categories?: Array<{ name: string }> | null
}

// ─── Main POS Page ───────────────────────────────────────────────────────────

const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga",
  "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf",
])

const toMinorUnits = (amount: number, currencyCode: string) => {
  if (!amount || !currencyCode) return amount
  const code = currencyCode.toLowerCase()
  if (ZERO_DECIMAL_CURRENCIES.has(code)) return Math.round(amount)
  return Math.round(amount * 100)
}

export default function POSTerminal() {
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Store
  const store = usePOSStore()

  // Audit
  const audit = useAuditStore()

  // Auth check
  const [authed, setAuthed] = useState(false)
  useEffect(() => {
    const token = localStorage.getItem("pos_admin_token")
    if (!token) {
      router.push("/login")
    } else {
      setAuthed(true)
    }
  }, [router])

  // RBAC helper
  const can = (permission: Parameters<typeof hasPermission>[1]) =>
    hasPermission(store.staffRole, permission)

  // Product data
  const [products, setProducts] = useState<Product[]>([])
  const [totalProductCount, setTotalProductCount] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Mobile cart
  const [showMobileCart, setShowMobileCart] = useState(false)

  // Modals
  const [showPayment, setShowPayment] = useState(false)
  const [showDiscount, setShowDiscount] = useState(false)
  const [discountTarget, setDiscountTarget] = useState<string | null>(null) // item id or null for cart
  const [showNote, setShowNote] = useState(false)
  const [noteTarget, setNoteTarget] = useState<string | null>(null)
  const [showHeldSales, setShowHeldSales] = useState(false)

  // Receipt printing
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const receiptRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({ contentRef: receiptRef })

  // Currency
  const currency = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "GHS"

  // ─── Fetch Products ────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const params: any = { limit: 200 }
      if (searchQuery) params.q = searchQuery
      if (activeCategory) params.category_id = [activeCategory]
      const data = await getProducts(params)
      setProducts(data.products || [])
      setTotalProductCount(data.count || 0)
    } catch (err: any) {
      console.error("Failed to fetch products:", err)
      if (err.message?.includes("Unauthorized") || err.message?.includes("401")) {
        localStorage.removeItem("pos_admin_token")
        router.push("/login")
        return
      }
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [searchQuery, activeCategory, router])

  const loadMoreProducts = async () => {
    if (loadingMore) return
    try {
      setLoadingMore(true)
      const params: any = { limit: 200, offset: products.length }
      if (searchQuery) params.q = searchQuery
      if (activeCategory) params.category_id = [activeCategory]
      const data = await getProducts(params)
      setProducts((prev) => [...prev, ...(data.products || [])])
    } catch {
      toast.error("Failed to load more products")
    } finally {
      setLoadingMore(false)
    }
  }

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories()
      const cats = (data.product_categories || [])
        .map((c: any) => ({ id: c.id, name: c.name }))
      setCategories(cats)
    } catch {
      // non-critical
    }
  }, [])

  useEffect(() => {
    if (authed) {
      fetchProducts()
      fetchCategories()
    }
  }, [authed, fetchProducts, fetchCategories])

  // Debounced search
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => fetchProducts(), 300)
  }

  // ─── Barcode Scanner (USB Wedge) ──────────────────────────────────────────

  const barcodeBuffer = useRef("")
  const barcodeTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return

      if (e.key === "Enter" && barcodeBuffer.current.length >= 4) {
        const barcode = barcodeBuffer.current
        barcodeBuffer.current = ""
        handleBarcodeScanned(barcode)
        return
      }

      if (e.key.length === 1) {
        barcodeBuffer.current += e.key
        if (barcodeTimer.current) clearTimeout(barcodeTimer.current)
        barcodeTimer.current = setTimeout(() => {
          barcodeBuffer.current = ""
        }, 100)
      }
    }

    window.addEventListener("keypress", handleKeyPress)
    return () => window.removeEventListener("keypress", handleKeyPress)
  }, [])

  const handleBarcodeScanned = async (barcode: string) => {
    try {
      playBeep()
      const data = await getProductByBarcode(barcode)
      if (data.products?.length) {
        const product = data.products[0]
        const variant = product.variants?.[0]
        if (variant) {
          addProductToCart(product, variant)
          toast.success(`Added: ${product.title}`)
          return
        }
      }
      toast.error(`Product not found for barcode: ${barcode}`)
    } catch {
      toast.error("Barcode lookup failed")
    }
  }

  // ─── Add to Cart ───────────────────────────────────────────────────────────

  const addProductToCart = (product: Product, variant: ProductVariant) => {
    // Block out-of-stock items
    if (variant.inventory_quantity != null && variant.inventory_quantity <= 0) {
      toast.error(`${product.title} is out of stock`)
      return
    }

    const price = variant.prices?.find(
      (p) => p.currency_code.toLowerCase() === currency.toLowerCase()
    )
    if (!price) {
      toast.error("No price found for this currency")
      return
    }

    const normalizedAmount = toMinorUnits(price.amount, price.currency_code)

    store.addItem({
      id: `${variant.id}-${Date.now()}`,
      variant_id: variant.id,
      product_id: product.id,
      title: product.title,
      variant_title: variant.title || "Default",
      thumbnail: product.thumbnail,
      quantity: 1,
      unit_price: normalizedAmount,
      currency_code: price.currency_code,
      barcode: variant.barcode,
      sku: variant.sku,
      inventory_quantity: variant.inventory_quantity,
    })
    playBeep()
  }

  // ─── Keyboard Shortcuts ────────────────────────────────────────────────────

  const [showShortcuts, setShowShortcuts] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F1 = Show shortcuts help
      if (e.key === "F1") {
        e.preventDefault()
        setShowShortcuts((v) => !v)
        return
      }
      // F2 = Focus search
      if (e.key === "F2") {
        e.preventDefault()
        searchInputRef.current?.focus()
        return
      }
      // F3 = Customer page
      if (e.key === "F3") {
        e.preventDefault()
        router.push("/customers")
        return
      }
      // F4 = Open payment
      if (e.key === "F4") {
        e.preventDefault()
        if (store.items.length) setShowPayment(true)
        return
      }
      // F5 = Transactions (if permitted)
      if (e.key === "F5") {
        e.preventDefault()
        if (can("pos.transactions")) router.push("/transactions")
        return
      }
      // F6 = Reports (if permitted)
      if (e.key === "F6") {
        e.preventDefault()
        if (can("pos.reports")) router.push("/reports")
        return
      }
      // F7 = Held sales
      if (e.key === "F7") {
        e.preventDefault()
        if (store.heldSales.length) setShowHeldSales(true)
        else toast("No held sales")
        return
      }
      // F8 = Clear cart
      if (e.key === "F8") {
        e.preventDefault()
        if (store.items.length && confirm("Clear all items from cart?")) {
          store.clearCart()
          toast("Cart cleared", { icon: "🗑️" })
        }
        return
      }
      // F9 = Hold sale
      if (e.key === "F9") {
        e.preventDefault()
        if (store.items.length) {
          store.holdCurrentSale(store.staffName || "Staff")
          audit.addEntry({
            action: "held_sale",
            staffName: store.staffName,
            staffRole: getRoleLabel(store.staffRole),
            detail: `Held sale with ${store.items.length} item(s)`,
          })
          toast.success("Sale held")
        }
        return
      }
      // Escape = Close modals
      if (e.key === "Escape") {
        setShowPayment(false)
        setShowDiscount(false)
        setShowNote(false)
        setShowHeldSales(false)
        setShowShortcuts(false)
        return
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [store, router, audit, can])

  if (!authed) return null

  const subtotal = store.getSubtotal()
  const itemDiscounts = store.items.reduce((s, i) => s + i.discount_amount, 0)
  const cartDiscountAmt = store.getCartDiscountAmount()
  const total = store.getTotal()

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-pos-bg">
      {/* Header */}
      <header className="pos-page-header">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Image src="/logo-white.png" alt="Letscase" width={28} height={28} className="w-7 h-7 dark:brightness-100 brightness-0" />
            <span className="text-pos-fg font-semibold text-sm hidden sm:block">Letscase POS</span>
          </div>
          <div className="hidden sm:block h-5 w-px bg-pos-border" />
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-pos-muted">
            {store.staffName}
            <span className={`pos-badge ${getRoleBadgeClasses(store.staffRole)}`}>
              {getRoleLabel(store.staffRole)}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          <nav className="hidden lg:flex items-center gap-0.5">
            {can("pos.customers") && (
              <button onClick={() => router.push("/customers")} className="pos-btn-ghost text-xs px-2.5">
                <Users className="w-3.5 h-3.5" /> <span className="hidden xl:inline">Customers</span>
              </button>
            )}
            {can("pos.refund") && (
              <button onClick={() => router.push("/refunds")} className="pos-btn-ghost text-xs px-2.5">
                <RotateCcw className="w-3.5 h-3.5" /> <span className="hidden xl:inline">Refunds</span>
              </button>
            )}
            {can("pos.transactions") && (
              <button onClick={() => router.push("/transactions")} className="pos-btn-ghost text-xs px-2.5">
                <ClipboardList className="w-3.5 h-3.5" /> <span className="hidden xl:inline">Sales</span>
              </button>
            )}
            {can("pos.reports") && (
              <button onClick={() => router.push("/reports")} className="pos-btn-ghost text-xs px-2.5">
                <BarChart3 className="w-3.5 h-3.5" /> <span className="hidden xl:inline">Reports</span>
              </button>
            )}
            {can("pos.shift_report") && (
              <button onClick={() => router.push("/shift-report")} className="pos-btn-ghost text-xs px-2.5">
                <Clock className="w-3.5 h-3.5" />
              </button>
            )}
            {can("pos.audit_log") && (
              <button onClick={() => router.push("/audit")} className="pos-btn-ghost text-xs px-2.5">
                <Shield className="w-3.5 h-3.5" />
              </button>
            )}
            {can("pos.manage_staff") && (
              <button onClick={() => router.push("/staff")} className="pos-btn-ghost text-xs px-2.5">
                <UserCog className="w-3.5 h-3.5" />
              </button>
            )}
          </nav>
          <div className="hidden lg:block h-5 w-px bg-pos-border mx-1" />
          <button
            onClick={() => {
              if (store.heldSales.length) setShowHeldSales(true)
              else toast("No held sales")
            }}
            className="pos-btn-ghost text-xs px-2 relative"
          >
            <Pause className="w-3.5 h-3.5" />
            {store.heldSales.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full text-[10px] text-white flex items-center justify-center font-semibold">
                {store.heldSales.length}
              </span>
            )}
          </button>
          <ThemeToggle />
          <button
            onClick={() => router.push("/pin-login")}
            className="pos-btn-ghost text-xs px-2 hidden sm:flex"
            title="Switch staff (PIN)"
          >
            <UserCheck className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              audit.addEntry({
                action: "logout",
                staffName: store.staffName,
                staffRole: getRoleLabel(store.staffRole),
                detail: "Logged out",
              })
              localStorage.removeItem("pos_admin_token")
              store.clearSession()
              router.push("/login")
            }}
            className="pos-btn-ghost text-xs px-2 text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Products */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search & Category Bar */}
          <div className="p-3 border-b border-pos-border space-y-2 bg-pos-bg-subtle">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pos-muted pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products or scan barcode..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pos-input-icon w-full pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); fetchProducts() }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-pos-muted hover:text-pos-fg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  toast("Point your barcode scanner at a product", { icon: "📷" })
                }}
                className="pos-btn-secondary px-3"
                title="Scan barcode"
              >
                <ScanBarcode className="w-4 h-4" />
              </button>
              <button
                onClick={() => { fetchProducts(); toast("Products refreshed") }}
                className="pos-btn-secondary px-3 hidden sm:flex"
                title="Refresh products"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              {/* Mobile cart toggle */}
              <button
                onClick={() => setShowMobileCart(true)}
                className="pos-btn-secondary px-3 lg:hidden relative"
              >
                <ShoppingCart className="w-4 h-4" />
                {store.getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                    {store.getItemCount()}
                  </span>
                )}
              </button>
            </div>

            {/* Category Pills */}
            {categories.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !activeCategory
                      ? "bg-brand text-white"
                      : "bg-pos-card text-pos-muted border border-pos-border hover:text-pos-fg"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeCategory === cat.id
                        ? "bg-brand text-white"
                        : "bg-pos-card text-pos-muted border border-pos-border hover:text-pos-fg"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-3 pb-20 md:pb-3">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-pos-muted">
                <Package className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">No products found</p>
                <p className="text-xs mt-1">Try a different search or category</p>
              </div>
            ) : (
              <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {products.flatMap((product) =>
                  (product.variants || []).map((variant) => ({ product, variant }))
                ).map(({ product, variant }) => {
                  const price = variant.prices?.find(
                    (p) => p.currency_code.toLowerCase() === currency.toLowerCase()
                  )
                  const isOutOfStock = variant.inventory_quantity != null && variant.inventory_quantity <= 0
                  const showVariantTitle = product.variants.length > 1
                  return (
                    <button
                      key={variant.id}
                      onClick={() => addProductToCart(product, variant)}
                      disabled={isOutOfStock}
                      className={`pos-card p-2.5 text-left transition-all group cursor-pointer active:scale-[0.97] ${
                        isOutOfStock
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:border-brand/40 hover:shadow-card-hover"
                      }`}
                    >
                      <div className="aspect-square rounded-lg bg-pos-bg-subtle mb-2 overflow-hidden flex items-center justify-center">
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-pos-muted opacity-40" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-pos-fg truncate">{product.title}</p>
                      {showVariantTitle && (
                        <p className="text-[10px] text-brand/70 truncate font-medium">{variant.title}</p>
                      )}
                      <p className="text-sm font-semibold text-brand mt-1">
                        {price && price.amount > 0
                          ? formatCurrency(
                              toMinorUnits(price.amount, price.currency_code),
                              price.currency_code
                            )
                          : price
                          ? "Free"
                          : "—"}
                      </p>
                      {variant.inventory_quantity != null && variant.inventory_quantity <= 5 && (
                        <p className="text-[10px] text-orange-600 dark:text-orange-400 mt-0.5">
                          {variant.inventory_quantity === 0 ? "Out of stock" : `${variant.inventory_quantity} left`}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
              {products.length < totalProductCount && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={loadMoreProducts}
                    disabled={loadingMore}
                    className="pos-btn-secondary text-xs px-6"
                  >
                    {loadingMore
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...</>
                      : `Load more (${totalProductCount - products.length} remaining)`}
                  </button>
                </div>
              )}
              </>
            )}
          </div>
        </div>

        {/* Right: Cart Panel (desktop) */}
        <div className="hidden lg:flex w-[380px] xl:w-[400px] bg-pos-card border-l border-pos-border flex-col shrink-0">
          <CartPanel
            store={store}
            currency={currency}
            subtotal={subtotal}
            itemDiscounts={itemDiscounts}
            cartDiscountAmt={cartDiscountAmt}
            total={total}
            can={can}
            onPayment={() => setShowPayment(true)}
            onDiscount={(id) => { setDiscountTarget(id); setShowDiscount(true) }}
            onNote={(id) => { setNoteTarget(id); setShowNote(true) }}
            onCustomer={() => router.push("/customers")}
            audit={audit}
          />
        </div>
      </div>

      {/* Mobile Cart Drawer */}
      {showMobileCart && (
        <div className="cart-overlay lg:hidden" onClick={() => setShowMobileCart(false)} />
      )}
      <div className={`cart-drawer lg:hidden flex flex-col ${showMobileCart ? "cart-drawer-open" : "cart-drawer-closed"}`}>
        <div className="p-3 border-b border-pos-border flex items-center justify-between shrink-0">
          <span className="pos-page-title"><ShoppingCart className="w-4 h-4 text-brand" /> Cart ({store.getItemCount()})</span>
          <button onClick={() => setShowMobileCart(false)} className="pos-btn-ghost text-xs px-2">
            <X className="w-4 h-4" />
          </button>
        </div>
        <CartPanel
          store={store}
          currency={currency}
          subtotal={subtotal}
          itemDiscounts={itemDiscounts}
          cartDiscountAmt={cartDiscountAmt}
          total={total}
          can={can}
          onPayment={() => { setShowMobileCart(false); setShowPayment(true) }}
          onDiscount={(id) => { setShowMobileCart(false); setDiscountTarget(id); setShowDiscount(true) }}
          onNote={(id) => { setShowMobileCart(false); setNoteTarget(id); setShowNote(true) }}
          onCustomer={() => { setShowMobileCart(false); router.push("/customers") }}
          audit={audit}
        />
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav
        can={can}
        store={store}
        router={router}
        onOpenCart={() => setShowMobileCart(true)}
      />

      {/* ── Modals ──────────────────────────────────────────────────────────── */}

      {showPayment && (
        <PaymentModal
          items={store.items}
          total={total}
          subtotal={subtotal}
          itemDiscounts={itemDiscounts}
          cartDiscountAmt={cartDiscountAmt}
          cartDiscountLabel={
            store.cartDiscount?.type === "percentage"
              ? `(${store.cartDiscount.value}%)`
              : ""
          }
          currency={currency}
          customer={store.customer}
          staffName={store.staffName}
          cartNote={store.cartNote}
          onClose={() => setShowPayment(false)}
          onComplete={(method, receipt) => {
            store.addDrawerEntry({
              type: "sale",
              amount: total,
              note: `Sale via ${method}`,
            })
            setReceiptData(receipt)
            store.clearCart()
            setShowPayment(false)
            toast.success(`Payment received via ${method}!`)
          }}
        />
      )}

      {showDiscount && (
        <DiscountModal
          targetItemId={discountTarget}
          currency={currency}
          onClose={() => setShowDiscount(false)}
        />
      )}

      {showNote && (
        <NoteModal
          targetItemId={noteTarget}
          onClose={() => setShowNote(false)}
        />
      )}

      {showHeldSales && (
        <HeldSalesModal onClose={() => setShowHeldSales(false)} />
      )}

      {/* Receipt (hidden, for printing) */}
      {receiptData && (
        <ReceiptModal
          data={receiptData}
          receiptRef={receiptRef}
          onPrint={() => handlePrint()}
          onClose={() => setReceiptData(null)}
        />
      )}

      {/* Keyboard Shortcuts Help */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowShortcuts(false)}>
          <div className="bg-pos-card border border-pos-border rounded-2xl w-full max-w-sm mx-4 shadow-modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-pos-border">
              <h2 className="text-lg font-bold text-pos-fg">Keyboard Shortcuts</h2>
              <button onClick={() => setShowShortcuts(false)} className="text-pos-muted hover:text-pos-fg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2 text-sm">
              {[
                ["F1", "Toggle this help"],
                ["F2", "Focus search / barcode"],
                ["F3", "Customers"],
                ["F4", "Open payment"],
                ["F5", "Transaction history"],
                ["F6", "Reports"],
                ["F7", "View held sales"],
                ["F8", "Clear cart"],
                ["F9", "Hold current sale"],
                ["Esc", "Close modal / dialog"],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-pos-muted">{desc}</span>
                  <kbd className="bg-pos-bg border border-pos-border rounded px-2 py-0.5 text-xs font-mono text-pos-fg">{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Cart Item Row ───────────────────────────────────────────────────────────

function CartItemRow({
  item,
  currency,
  onUpdateQty,
  onRemove,
  onDiscount,
  onNote,
}: {
  item: POSCartItem
  currency: string
  onUpdateQty: (qty: number) => void
  onRemove: () => void
  onDiscount: () => void
  onNote: () => void
}) {
  const lineTotal = item.unit_price * item.quantity - item.discount_amount

  return (
    <div className="bg-pos-bg rounded-lg p-2.5 group">
      <div className="flex gap-2">
        <div className="w-10 h-10 rounded-md bg-pos-card flex items-center justify-center shrink-0 overflow-hidden">
          {item.thumbnail ? (
            <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <Package className="w-4 h-4 text-pos-muted" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-pos-fg truncate">{item.title}</p>
          <p className="text-[10px] text-pos-muted">
            {formatCurrency(item.unit_price, currency)} each
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-bold text-pos-fg">{formatCurrency(lineTotal, currency)}</p>
          {item.discount_amount > 0 && (
            <p className="text-[10px] text-orange-600 dark:text-orange-400">-{formatCurrency(item.discount_amount, currency)}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdateQty(item.quantity - 1)}
            className="qty-btn w-7 h-7 rounded-md bg-pos-card border border-pos-border flex items-center justify-center text-pos-fg"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-8 text-center text-sm font-semibold text-pos-fg">{item.quantity}</span>
          <button
            onClick={() => onUpdateQty(item.quantity + 1)}
            className="qty-btn w-7 h-7 rounded-md bg-pos-card border border-pos-border flex items-center justify-center text-pos-fg"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        <div className="flex gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          <button onClick={onDiscount} className="p-1.5 rounded text-pos-muted hover:text-orange-600 dark:hover:text-orange-400" title="Discount">
            <Tag className="w-3 h-3" />
          </button>
          <button onClick={onNote} className="p-1.5 rounded text-pos-muted hover:text-teal-600 dark:hover:text-teal-400" title="Note">
            <MessageSquare className="w-3 h-3" />
          </button>
          <button onClick={onRemove} className="p-1.5 rounded text-pos-muted hover:text-red-600 dark:hover:text-red-400" title="Remove">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      {item.note && (
        <p className="mt-1.5 text-[10px] text-teal-600 dark:text-teal-400 bg-teal-500/10 rounded px-2 py-1">
          📝 {item.note}
        </p>
      )}
    </div>
  )
}

// ─── Cart Panel (shared between desktop sidebar & mobile drawer) ────────────

function CartPanel({
  store,
  currency,
  subtotal,
  itemDiscounts,
  cartDiscountAmt,
  total,
  can,
  onPayment,
  onDiscount,
  onNote,
  onCustomer,
  audit,
}: {
  store: POSState
  currency: string
  subtotal: number
  itemDiscounts: number
  cartDiscountAmt: number
  total: number
  can: (p: Parameters<typeof hasPermission>[1]) => boolean
  onPayment: () => void
  onDiscount: (id: string | null) => void
  onNote: (id: string | null) => void
  onCustomer: () => void
  audit: any
}) {
  return (
    <>
      {/* Cart Header */}
      <div className="p-3 border-b border-pos-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-brand" />
          <span className="text-sm font-semibold text-pos-fg">
            Cart ({store.getItemCount()})
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => {
              store.holdCurrentSale(store.staffName || "Staff")
              audit.addEntry({
                action: "held_sale",
                staffName: store.staffName,
                staffRole: getRoleLabel(store.staffRole),
                detail: `Held sale with ${store.items.length} item(s)`,
              })
              toast.success("Sale held")
            }}
            disabled={!store.items.length}
            className="pos-btn-ghost text-xs px-2"
            title="Hold sale (F9)"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (confirm("Clear all items from cart?")) {
                store.clearCart()
                toast("Cart cleared")
              }
            }}
            disabled={!store.items.length}
            className="pos-btn-ghost text-xs px-2 text-red-600 dark:text-red-400"
            title="Clear cart (F8)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {store.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-pos-muted py-12">
            <ShoppingCart className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">Cart is empty</p>
            <p className="text-xs mt-1 text-pos-muted">Scan or select products to add</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {store.items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                currency={currency}
                onUpdateQty={(qty) => store.updateQuantity(item.id, qty)}
                onRemove={() => store.removeItem(item.id)}
                onDiscount={() => onDiscount(item.id)}
                onNote={() => onNote(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart Totals */}
      <div className="border-t border-pos-border p-3 space-y-1.5 shrink-0">
        <div className="flex justify-between text-sm text-pos-muted">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal, currency)}</span>
        </div>
        {itemDiscounts > 0 && (
          <div className="flex justify-between text-sm text-orange-600 dark:text-orange-400">
            <span>Item Discounts</span>
            <span>-{formatCurrency(itemDiscounts, currency)}</span>
          </div>
        )}
        {cartDiscountAmt > 0 && (
          <div className="flex justify-between text-sm text-orange-600 dark:text-orange-400">
            <span>
              Cart Discount
              {store.cartDiscount?.type === "percentage" && ` (${store.cartDiscount.value}%)`}
            </span>
            <span>-{formatCurrency(cartDiscountAmt, currency)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold text-pos-fg pt-1.5 border-t border-pos-border">
          <span>Total</span>
          <span className="text-brand">{formatCurrency(total, currency)}</span>
        </div>
      </div>

      {/* Cart Actions */}
      <div className="p-3 border-t border-pos-border grid grid-cols-3 gap-1.5 shrink-0">
        <button
          onClick={() => {
            if (!can("pos.discount.cart")) {
              toast.error("No permission for cart discounts")
              return
            }
            onDiscount(null)
          }}
          disabled={!store.items.length}
          className="pos-btn-secondary text-xs px-2"
        >
          <Tag className="w-3.5 h-3.5" /> Discount
        </button>
        <button
          onClick={() => onNote(null)}
          className="pos-btn-secondary text-xs px-2"
        >
          <MessageSquare className="w-3.5 h-3.5" /> Note
        </button>
        <button
          onClick={onCustomer}
          className="pos-btn-secondary text-xs px-2"
        >
          <Users className="w-3.5 h-3.5" /> Customer
        </button>
      </div>

      {/* Payment Button */}
      <div className="p-3 border-t border-pos-border shrink-0">
        <button
          onClick={onPayment}
          disabled={!store.items.length}
          className="pos-btn-success w-full h-12 text-base font-bold"
        >
          <DollarSign className="w-5 h-5" />
          Pay {formatCurrency(total, currency)}
        </button>
      </div>
    </>
  )
}

// ─── Payment Modal ───────────────────────────────────────────────────────────

type PayMethod = "cash" | "momo" | "telecel_agent"

function PaymentModal({
  items,
  total,
  subtotal,
  itemDiscounts,
  cartDiscountAmt,
  cartDiscountLabel,
  currency,
  customer,
  staffName,
  cartNote,
  onClose,
  onComplete,
}: {
  items: POSCartItem[]
  total: number
  subtotal: number
  itemDiscounts: number
  cartDiscountAmt: number
  cartDiscountLabel: string
  currency: string
  customer: any | null
  staffName: string
  cartNote: string
  onClose: () => void
  onComplete: (method: string, receipt: ReceiptData) => void
}) {
  const [method, setMethod] = useState<PayMethod>("cash")
  const [cashReceived, setCashReceived] = useState("")
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [statusText, setStatusText] = useState("")

  // MoMo fields
  const [momoPhone, setMomoPhone] = useState("")
  const [momoProvider, setMomoProvider] = useState<"mtn" | "vod" | "atl">("mtn")

  // Telecel Agent fields
  const [agentCode, setAgentCode] = useState("")
  const [agentPhone, setAgentPhone] = useState("")
  const [agentTxnRef, setAgentTxnRef] = useState("")

  const cashAmount = parseFloat(cashReceived) * 100 || 0
  const change = Math.max(0, cashAmount - total)

  const canPay =
    method === "cash"
      ? cashAmount >= total
      : method === "momo"
      ? momoPhone.length >= 10
      : method === "telecel_agent"
      ? agentCode.trim().length > 0 && agentPhone.length >= 10
      : false

  // ── Create draft order in Medusa ──────────────────────────────────────────
  const createOrder = async (paymentMethod: string, paymentMeta: Record<string, string> = {}) => {
    try {
      const regionsData = await getRegions()
      const region = regionsData.regions?.[0]
      if (!region) throw new Error("No region configured in Medusa")

      const draftItems = items.map((item) => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        metadata: {
          ...(item.discount_amount > 0 ? { discount: String(item.discount_amount) } : {}),
          ...(item.note ? { note: item.note } : {}),
        },
      }))

      let shippingMethods: Array<{ option_id: string; price: number }> = []
      try {
        const shippingData = await getShippingOptions(region.id)
        if (shippingData.shipping_options?.length) {
          shippingMethods = [{ option_id: shippingData.shipping_options[0].id, price: 0 }]
        }
      } catch {
        // OK for POS
      }

      const draftData = await createDraftOrder({
        region_id: region.id,
        email: customer?.email || "pos@letscase.com",
        items: draftItems,
        shipping_methods: shippingMethods,
        ...(customer?.id ? { customer_id: customer.id } : {}),
        no_notification_order: true,
        metadata: {
          source: "pos",
          payment_method: paymentMethod,
          staff: staffName,
          ...(cartNote ? { note: cartNote } : {}),
          ...paymentMeta,
        },
      })

      if (draftData.draft_order?.id) {
        try {
          await markDraftOrderPaid(draftData.draft_order.id)
        } catch (payErr: any) {
          console.warn("Could not mark draft order as paid:", payErr)
          toast.error("Order created but could not be marked as paid — check admin dashboard")
        }
      }
    } catch (err: any) {
      console.error("Draft order creation failed:", err)
      toast.error(`Order sync failed: ${err.message || "unknown error"}. Payment was collected but the order was not recorded in the system.`)
    }
  }

  // ── Build receipt data ────────────────────────────────────────────────────
  const buildReceipt = (methodLabel: string, extra?: Partial<ReceiptData>): ReceiptData => ({
    items: [...items],
    subtotal,
    itemDiscounts,
    cartDiscount: cartDiscountAmt,
    cartDiscountLabel,
    total,
    currency,
    paymentMethod: methodLabel,
    customerName: customer
      ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
      : undefined,
    staffName,
    note: cartNote || undefined,
    ...extra,
  })

  // ── Handle Cash ───────────────────────────────────────────────────────────
  const handleCashPay = async () => {
    setProcessing(true)
    setError("")
    await createOrder("cash")
    const receipt = buildReceipt("Cash", {
      cashReceived: cashAmount,
      change,
    })
    setProcessing(false)
    onComplete("Cash", receipt)
  }

  // ── Handle MoMo via Paystack Charge API ───────────────────────────────────
  const handleMoMoPay = async () => {
    setProcessing(true)
    setError("")
    setStatusText("Sending payment prompt to phone...")

    try {
      // Dynamic import to avoid bundling on server
      const { chargeMobileMoney, pollTransactionStatus, MOMO_PROVIDERS } = await import("@/lib/paystack")

      const providerName = MOMO_PROVIDERS.find((p) => p.code === momoProvider)?.name || "Mobile Money"
      const email = customer?.email || "pos@letscase.com"
      const reference = `pos-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      const chargeResult = await chargeMobileMoney({
        email,
        amount: total,
        currency: "GHS",
        reference,
        mobile_money: {
          phone: momoPhone,
          provider: momoProvider,
        },
        metadata: {
          source: "pos",
          staff: staffName,
          custom_fields: [
            { display_name: "Source", variable_name: "source", value: "POS" },
            { display_name: "Staff", variable_name: "staff", value: staffName },
          ],
        },
      })

      if (chargeResult.data.status === "pay_offline") {
        setStatusText(chargeResult.data.display_text || "Waiting for customer to authorize on phone...")

        // Poll until success or failure (up to 3 min)
        await pollTransactionStatus(reference, {
          intervalMs: 4000,
          timeoutMs: 190000,
          onPoll: (s) => {
            if (s === "pending") setStatusText("Waiting for authorization...")
          },
        })

        // Success — create the order
        setStatusText("Payment confirmed! Creating order...")
        await createOrder(`momo_${momoProvider}`, {
          paystack_reference: reference,
          momo_phone: momoPhone,
          momo_provider: momoProvider,
        })

        const receipt = buildReceipt(`${providerName}`, {
          note: cartNote ? `${cartNote} | Ref: ${reference}` : `Ref: ${reference}`,
        })
        setProcessing(false)
        onComplete(providerName, receipt)
      } else if (chargeResult.data.status === "success") {
        // Instant success (unlikely for MoMo but handle it)
        await createOrder(`momo_${momoProvider}`, {
          paystack_reference: reference,
          momo_phone: momoPhone,
          momo_provider: momoProvider,
        })
        const receipt = buildReceipt(`${providerName}`, {
          note: cartNote ? `${cartNote} | Ref: ${reference}` : `Ref: ${reference}`,
        })
        setProcessing(false)
        onComplete(providerName, receipt)
      } else {
        throw new Error(chargeResult.data.display_text || chargeResult.message || "Charge failed")
      }
    } catch (err: any) {
      setProcessing(false)
      setStatusText("")
      setError(err.message || "Mobile Money payment failed")
    }
  }

  // ── Handle Telecel Agent (manual tracking) ────────────────────────────────
  const handleAgentPay = async () => {
    setProcessing(true)
    setError("")

    await createOrder("telecel_agent", {
      agent_code: agentCode.trim(),
      agent_phone: agentPhone.trim(),
      agent_txn_ref: agentTxnRef.trim(),
    })

    const receipt = buildReceipt("Telecel Agent", {
      note: [
        cartNote,
        `Agent: ${agentCode}`,
        `Agent Phone: ${agentPhone}`,
        agentTxnRef ? `Txn Ref: ${agentTxnRef}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    })
    setProcessing(false)
    onComplete("Telecel Agent", receipt)
  }

  const handlePay = useCallback(() => {
    if (method === "cash") return handleCashPay()
    if (method === "momo") return handleMoMoPay()
    if (method === "telecel_agent") return handleAgentPay()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, cashAmount, total, momoPhone, momoProvider, agentCode, agentPhone, agentTxnRef])

  // Enter key to submit payment
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && canPay && !processing) {
        e.preventDefault()
        handlePay()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [canPay, processing, handlePay])

  // Quick cash buttons
  const quickAmounts = [
    total,
    Math.ceil(total / 500) * 500,
    Math.ceil(total / 1000) * 1000,
    Math.ceil(total / 5000) * 5000,
  ].filter((v, i, a) => a.indexOf(v) === i && v >= total)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={processing ? undefined : onClose}>
      <div className="bg-pos-card border border-pos-border rounded-2xl w-full max-w-md mx-4 shadow-modal max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-pos-border sticky top-0 bg-pos-card z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-pos-fg">Payment</h2>
          <button onClick={onClose} className="text-pos-muted hover:text-pos-fg" disabled={processing}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="text-center">
            <p className="text-pos-muted text-sm">Total Amount</p>
            <p className="text-3xl font-bold text-brand">{formatCurrency(total, currency)}</p>
          </div>

          {/* Payment Method Toggle */}
          <div className="grid grid-cols-3 gap-1.5">
            {([
              { key: "cash" as PayMethod, label: "Cash", icon: <DollarSign className="w-5 h-5" /> },
              { key: "momo" as PayMethod, label: "MoMo", icon: <Smartphone className="w-5 h-5" /> },
              { key: "telecel_agent" as PayMethod, label: "Agent", icon: <Users className="w-5 h-5" /> },
            ]).map((m) => (
              <button
                key={m.key}
                onClick={() => { setMethod(m.key); setError(""); setStatusText("") }}
                disabled={processing}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  method === m.key
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-pos-border text-pos-muted hover:text-pos-fg"
                }`}
              >
                <div className="mx-auto mb-0.5 flex justify-center">{m.icon}</div>
                <span className="text-xs font-medium">{m.label}</span>
              </button>
            ))}
          </div>

          {/* ── Cash Panel ──────────────────────────────────────────────────── */}
          {method === "cash" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-pos-muted mb-1">Cash Received</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={cashReceived}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v === "" || /^\d*\.?\d{0,2}$/.test(v)) setCashReceived(v)
                  }}
                  className="pos-input w-full text-xl text-center h-14 font-bold"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCashReceived((amt / 100).toFixed(2))}
                    className="pos-btn-secondary text-xs"
                  >
                    {formatCurrency(amt, currency)}
                  </button>
                ))}
              </div>
              {cashAmount > 0 && cashAmount >= total && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">Change</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(change, currency)}</p>
                </div>
              )}
            </div>
          )}

          {/* ── MoMo Panel (Paystack) ──────────────────────────────────────── */}
          {method === "momo" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-pos-muted mb-1.5">Network Provider</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { code: "mtn" as const, name: "MTN", bg: "bg-yellow-500/20 border-yellow-500/50 text-yellow-700 dark:text-yellow-300" },
                    { code: "vod" as const, name: "Telecel", bg: "bg-red-500/20 border-red-500/50 text-red-700 dark:text-red-300" },
                    { code: "atl" as const, name: "AirtelTigo", bg: "bg-pink-500/20 border-pink-500/50 text-pink-700 dark:text-pink-300" },
                  ]).map((p) => (
                    <button
                      key={p.code}
                      onClick={() => setMomoProvider(p.code)}
                      className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                        momoProvider === p.code ? p.bg : "border-pos-border text-pos-muted hover:text-pos-fg"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-pos-muted mb-1">Customer Phone Number</label>
                <input
                  type="tel"
                  value={momoPhone}
                  onChange={(e) => setMomoPhone(e.target.value.replace(/[^0-9]/g, ""))}
                  className="pos-input w-full text-center text-lg font-bold h-12"
                  placeholder="0551234567"
                  autoFocus
                  maxLength={10}
                />
              </div>
              <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-3 text-center">
                <Smartphone className="w-6 h-6 text-teal-600 dark:text-teal-400 mx-auto mb-1" />
                <p className="text-xs text-teal-600 dark:text-teal-400">
                  Customer will receive a payment prompt on their phone via Paystack
                </p>
              </div>
            </div>
          )}

          {/* ── Telecel Agent Panel ────────────────────────────────────────── */}
          {method === "telecel_agent" && (
            <div className="space-y-3">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-xs text-red-700 dark:text-red-300 font-semibold mb-1">Telecel Agent Payment</p>
                <p className="text-[10px] text-red-700/70 dark:text-red-300/70">
                  Record payment details from the Telecel agent transaction.
                  The agent dials *110# and processes the payment using their agent SIM.
                </p>
              </div>
              <div>
                <label className="block text-xs text-pos-muted mb-1">Agent Code *</label>
                <input
                  type="text"
                  value={agentCode}
                  onChange={(e) => setAgentCode(e.target.value)}
                  className="pos-input w-full"
                  placeholder="e.g. TC-12345"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-pos-muted mb-1">Agent Phone Number *</label>
                <input
                  type="tel"
                  value={agentPhone}
                  onChange={(e) => setAgentPhone(e.target.value)}
                  className="pos-input w-full"
                  placeholder="050 123 4567"
                />
              </div>
              <div>
                <label className="block text-xs text-pos-muted mb-1">Transaction Reference (from SMS)</label>
                <input
                  type="text"
                  value={agentTxnRef}
                  onChange={(e) => setAgentTxnRef(e.target.value)}
                  className="pos-input w-full"
                  placeholder="Optional — enter the reference from the confirmation SMS"
                />
              </div>
            </div>
          )}

          {/* Status / Error */}
          {statusText && (
            <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-3 text-center">
              <Loader2 className="w-5 h-5 text-teal-600 dark:text-teal-400 mx-auto mb-1 animate-spin" />
              <p className="text-xs text-teal-600 dark:text-teal-400">{statusText}</p>
            </div>
          )}
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 text-center bg-red-500/10 border border-red-500/30 rounded-lg p-2">{error}</p>
          )}

          <button
            onClick={handlePay}
            disabled={!canPay || processing}
            className="pos-btn-success w-full h-12 text-base font-bold"
          >
            {processing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Complete Payment</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Receipt Modal ───────────────────────────────────────────────────────────

function ReceiptModal({
  data,
  receiptRef,
  onPrint,
  onClose,
}: {
  data: ReceiptData
  receiptRef: React.RefObject<HTMLDivElement | null>
  onPrint: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-pos-card border border-pos-border rounded-2xl w-full max-w-sm mx-4 shadow-modal max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-pos-border shrink-0">
          <h2 className="text-lg font-bold text-pos-fg flex items-center gap-2">
            <Receipt className="w-5 h-5 text-brand" />
            Receipt
          </h2>
          <button onClick={onClose} className="text-pos-muted hover:text-pos-fg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex justify-center p-4 bg-pos-bg-subtle">
          <ReceiptPrint ref={receiptRef} data={data} />
        </div>

        <div className="p-4 border-t border-pos-border flex gap-2">
          <button onClick={onPrint} className="pos-btn-primary flex-1">
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
          <button onClick={onClose} className="pos-btn-secondary flex-1">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Discount Modal ──────────────────────────────────────────────────────────

function DiscountModal({
  targetItemId,
  currency,
  onClose,
}: {
  targetItemId: string | null
  currency: string
  onClose: () => void
}) {
  const store = usePOSStore()
  const [type, setType] = useState<"percentage" | "fixed">("percentage")
  const [value, setValue] = useState("")

  const apply = () => {
    const numVal = parseFloat(value)
    if (!numVal || numVal <= 0) return
    if (type === "percentage" && numVal > 100) {
      toast.error("Percentage cannot exceed 100%")
      return
    }

    if (targetItemId) {
      const fixedVal = type === "fixed" ? Math.round(numVal * 100) : numVal
      store.setItemDiscount(targetItemId, type, fixedVal)
      toast.success("Item discount applied")
    } else {
      const fixedVal = type === "fixed" ? Math.round(numVal * 100) : numVal
      store.setCartDiscount({ type, value: fixedVal })
      toast.success("Cart discount applied")
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-pos-card border border-pos-border rounded-2xl w-full max-w-sm mx-4 shadow-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-pos-border">
          <h2 className="text-lg font-bold text-pos-fg">
            {targetItemId ? "Item Discount" : "Cart Discount"}
          </h2>
          <button onClick={onClose} className="text-pos-muted hover:text-pos-fg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setType("percentage")}
              className={`p-2.5 rounded-lg border text-center text-sm font-medium ${
                type === "percentage" ? "border-brand bg-brand/10 text-brand" : "border-pos-border text-pos-muted"
              }`}
            >
              Percentage (%)
            </button>
            <button
              onClick={() => setType("fixed")}
              className={`p-2.5 rounded-lg border text-center text-sm font-medium ${
                type === "fixed" ? "border-brand bg-brand/10 text-brand" : "border-pos-border text-pos-muted"
              }`}
            >
              Fixed Amount
            </button>
          </div>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") apply() }}
            className="pos-input w-full text-xl text-center h-14 font-bold"
            placeholder={type === "percentage" ? "10" : "5.00"}
            autoFocus
            step={type === "percentage" ? "1" : "0.01"}
          />
          <div className="flex gap-2">
            {type === "percentage"
              ? [5, 10, 15, 20, 25].map((v) => (
                  <button key={v} onClick={() => setValue(String(v))} className="pos-btn-secondary text-xs flex-1">
                    {v}%
                  </button>
                ))
              : [1, 2, 5, 10, 20].map((v) => (
                  <button key={v} onClick={() => setValue(String(v))} className="pos-btn-secondary text-xs flex-1">
                    {v}
                  </button>
                ))}
          </div>
          <button onClick={apply} className="pos-btn-primary w-full h-11">
            Apply Discount
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Note Modal ──────────────────────────────────────────────────────────────

function NoteModal({
  targetItemId,
  onClose,
}: {
  targetItemId: string | null
  onClose: () => void
}) {
  const store = usePOSStore()
  const existing = targetItemId
    ? store.items.find((i) => i.id === targetItemId)?.note || ""
    : store.cartNote
  const [note, setNote] = useState(existing)

  const save = () => {
    if (targetItemId) {
      store.setItemNote(targetItemId, note)
    } else {
      store.setCartNote(note)
    }
    toast.success("Note saved")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-pos-card border border-pos-border rounded-2xl w-full max-w-sm mx-4 shadow-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-pos-border">
          <h2 className="text-lg font-bold text-pos-fg">
            {targetItemId ? "Item Note" : "Sale Note"}
          </h2>
          <button onClick={onClose} className="text-pos-muted hover:text-pos-fg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) save() }}
            className="pos-input w-full h-28 resize-none"
            placeholder="Add a note... (Ctrl+Enter to save)"
            autoFocus
          />
          <button onClick={save} className="pos-btn-primary w-full h-11">
            Save Note
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Held Sales Modal ────────────────────────────────────────────────────────

function HeldSalesModal({ onClose }: { onClose: () => void }) {
  const store = usePOSStore()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-pos-card border border-pos-border rounded-2xl w-full max-w-md mx-4 shadow-modal max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-pos-border shrink-0">
          <h2 className="text-lg font-bold text-pos-fg">Held Sales ({store.heldSales.length})</h2>
          <button onClick={onClose} className="text-pos-muted hover:text-pos-fg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {store.heldSales.map((sale) => {
            const saleTotal = sale.items.reduce(
              (sum, i) => sum + i.unit_price * i.quantity - i.discount_amount,
              0
            )
            return (
              <div key={sale.id} className="bg-pos-bg rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-pos-fg">
                      {sale.items.length} item{sale.items.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-pos-muted">
                      {new Date(sale.created_at).toLocaleTimeString()} · {sale.staff_name}
                    </p>
                    {sale.note && <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">📝 {sale.note}</p>}
                  </div>
                  <p className="text-sm font-bold text-brand">
                    {formatCurrency(saleTotal, sale.items[0]?.currency_code || "GHS")}
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      store.restoreHeldSale(sale.id)
                      onClose()
                      toast.success("Sale restored")
                    }}
                    className="pos-btn-primary text-xs flex-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Restore
                  </button>
                  <button
                    onClick={() => {
                      store.removeHeldSale(sale.id)
                      if (store.heldSales.length <= 1) onClose()
                    }}
                    className="pos-btn-danger text-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────

function MobileBottomNav({
  can,
  store,
  router,
  onOpenCart,
}: {
  can: (p: Parameters<typeof hasPermission>[1]) => boolean
  store: POSState
  router: any
  onOpenCart: () => void
}) {
  const [showMore, setShowMore] = useState(false)

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-20 md:hidden" onClick={() => setShowMore(false)}>
          <div
            className="absolute bottom-14 right-2 bg-pos-card border border-pos-border rounded-xl shadow-modal p-1.5 min-w-[160px] space-y-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            {can("pos.shift_report") && (
              <button onClick={() => { setShowMore(false); router.push("/shift-report") }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-pos-fg hover-subtle transition-colors">
                <Clock className="w-4 h-4 text-pos-muted" /> Shift Report
              </button>
            )}
            {can("pos.refund") && (
              <button onClick={() => { setShowMore(false); router.push("/refunds") }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-pos-fg hover-subtle transition-colors">
                <RotateCcw className="w-4 h-4 text-pos-muted" /> Refunds
              </button>
            )}
            {can("pos.audit_log") && (
              <button onClick={() => { setShowMore(false); router.push("/audit") }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-pos-fg hover-subtle transition-colors">
                <Shield className="w-4 h-4 text-pos-muted" /> Audit Log
              </button>
            )}
            {can("pos.manage_staff") && (
              <button onClick={() => { setShowMore(false); router.push("/staff") }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-pos-fg hover-subtle transition-colors">
                <UserCog className="w-4 h-4 text-pos-muted" /> Staff
              </button>
            )}
            <button onClick={() => { setShowMore(false); router.push("/visual-novel") }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-pos-fg hover-subtle transition-colors">
              <BookOpen className="w-4 h-4 text-pos-muted" /> Visual Novel
            </button>
            <button onClick={() => { setShowMore(false); router.push("/pin-login") }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-pos-fg hover-subtle transition-colors">
              <UserCheck className="w-4 h-4 text-pos-muted" /> Switch Staff
            </button>
          </div>
        </div>
      )}

      <div className="mobile-nav">
        <button onClick={() => router.push("/")} className="mobile-nav-item mobile-nav-item-active">
          <Package className="w-5 h-5" />
          <span>Terminal</span>
        </button>
        {can("pos.customers") && (
          <button onClick={() => router.push("/customers")} className="mobile-nav-item">
            <Users className="w-5 h-5" />
            <span>Customers</span>
          </button>
        )}
        {can("pos.transactions") && (
          <button onClick={() => router.push("/transactions")} className="mobile-nav-item">
            <ClipboardList className="w-5 h-5" />
            <span>Sales</span>
          </button>
        )}
        <button
          onClick={onOpenCart}
          className="mobile-nav-item relative"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Cart</span>
          {store.getItemCount() > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 bg-brand rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              {store.getItemCount()}
            </span>
          )}
        </button>
        <button onClick={() => setShowMore(!showMore)} className="mobile-nav-item">
          <MoreHorizontal className="w-5 h-5" />
          <span>More</span>
        </button>
      </div>
    </>
  )
}
