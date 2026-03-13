"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Search, Plus, Minus, Trash2, ShoppingCart, DollarSign,
  Smartphone, Tag, MessageSquare, Pause, RotateCcw, Users,
  BarChart3, LogOut, ScanBarcode, Package, Shield, ClipboardList,
  X, Loader2, Receipt, Printer, Clock, UserCheck, UserCog,
  RefreshCw, MoreHorizontal, Star, Wifi, WifiOff, Settings, PlusCircle,
  AlertTriangle, Split, Percent, PhoneCall, Info,
} from "lucide-react"
import toast from "react-hot-toast"
import { usePOSStore, type POSCartItem, type POSState } from "@/lib/store"
import { getProducts, getCategories, getProductByBarcode, createDraftOrder, markDraftOrderPaid, getRegions, getShippingOptions } from "@/lib/medusa-client"
import { hasPermission, getRoleBadgeClasses, getRoleLabel } from "@/lib/rbac"
import { useAuditStore } from "@/lib/audit"
import { formatCurrency, playBeep, playPurchaseSuccess } from "@/lib/utils"
import * as Tooltip from "@radix-ui/react-tooltip"
import ReceiptPrint, { type ReceiptData } from "@/components/receipt"
import { useReactToPrint } from "react-to-print"
import { ThemeToggle } from "@/components/theme-toggle"

import { usePaystack } from "@/hooks/usePaystack"

declare global {
  interface Window {
    PaystackPop: any
  }
}

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
  const can = useCallback(
    (permission: Parameters<typeof hasPermission>[1]) =>
      hasPermission(store.staffRole, permission),
    [store.staffRole]
  )

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

  // Online/Offline status
  const [online, setOnline] = useState(true)
  useEffect(() => {
    setOnline(navigator.onLine)
    const goOnline = () => setOnline(true)
    const goOffline = () => { setOnline(false); toast("You are offline. Orders will be queued.", { icon: "📡" }) }
    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline) }
  }, [])

  // Custom Item modal
  const [showCustomItem, setShowCustomItem] = useState(false)

  // Favorites filter
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // Low-stock alert tracking
  const lowStockAlerted = useRef(false)

  // Settings modal
  const [showSettings, setShowSettings] = useState(false)

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
      // Low-stock alert (once per session)
      if (!lowStockAlerted.current) {
        const lowStock = (data.products || []).flatMap((p: any) =>
          (p.variants || []).filter((v: any) => v.inventory_quantity != null && v.inventory_quantity > 0 && v.inventory_quantity <= 5)
        )
        if (lowStock.length > 0) {
          lowStockAlerted.current = true
          toast(`${lowStock.length} product(s) have low stock (≤5)`, { icon: "⚠️", duration: 5000 })
        }
      }
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

  // ─── Add to Cart ───────────────────────────────────────────────────────────

  const addProductToCart = useCallback((product: Product, variant: ProductVariant) => {
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

    const normalizedAmount = price.amount

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
  }, [currency, store])

  const handleBarcodeScanned = useCallback(async (barcode: string) => {
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
  }, [addProductToCart])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
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
  }, [handleBarcodeScanned])

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
        setShowCustomItem(false)
        setShowSettings(false)
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
    <Tooltip.Provider delayDuration={400}>
    <div className="flex flex-col h-[100dvh] bg-pos-bg overflow-hidden relative">
      {/* Header */}
      <header className="pos-page-header">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {/* Online/Offline indicator */}
            {!online && (
              <span className="flex items-center gap-1 text-xs text-orange-500 bg-orange-500/10 px-2 py-1 rounded-full" title="Offline — orders will be queued">
                <WifiOff className="w-3 h-3" /> Offline
              </span>
            )}
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
              <Tip label="Customers">
                <button onClick={() => router.push("/customers")} className="pos-btn-ghost text-xs px-2.5">
                  <Users className="w-3.5 h-3.5" /> <span className="hidden xl:inline">Customers</span>
                </button>
              </Tip>
            )}
            {can("pos.refund") && (
              <Tip label="Refunds">
                <button onClick={() => router.push("/refunds")} className="pos-btn-ghost text-xs px-2.5">
                  <RotateCcw className="w-3.5 h-3.5" /> <span className="hidden xl:inline">Refunds</span>
                </button>
              </Tip>
            )}
            {can("pos.transactions") && (
              <Tip label="Sales History">
                <button onClick={() => router.push("/transactions")} className="pos-btn-ghost text-xs px-2.5">
                  <ClipboardList className="w-3.5 h-3.5" /> <span className="hidden xl:inline">Sales</span>
                </button>
              </Tip>
            )}
            {can("pos.reports") && (
              <Tip label="Reports & Analytics">
                <button onClick={() => router.push("/reports")} className="pos-btn-ghost text-xs px-2.5">
                  <BarChart3 className="w-3.5 h-3.5" /> <span className="hidden xl:inline">Reports</span>
                </button>
              </Tip>
            )}
            {can("pos.shift_report") && (
              <Tip label="Shift Report">
                <button onClick={() => router.push("/shift-report")} className="pos-btn-ghost text-xs px-2.5">
                  <Clock className="w-3.5 h-3.5" />
                </button>
              </Tip>
            )}
            {can("pos.audit_log") && (
              <Tip label="Audit Log">
                <button onClick={() => router.push("/audit")} className="pos-btn-ghost text-xs px-2.5">
                  <Shield className="w-3.5 h-3.5" />
                </button>
              </Tip>
            )}
            {can("pos.manage_staff") && (
              <Tip label="Manage Staff">
                <button onClick={() => router.push("/staff")} className="pos-btn-ghost text-xs px-2.5">
                  <UserCog className="w-3.5 h-3.5" />
                </button>
              </Tip>
            )}
          </nav>
          <div className="hidden lg:block h-5 w-px bg-pos-border mx-1" />
          <Tip label="Held Sales">
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
          </Tip>
          <ThemeToggle />
          <Tip label="Switch Staff (PIN)">
            <button
              onClick={() => router.push("/pin-login")}
              className="pos-btn-ghost text-xs px-2 hidden sm:flex"
            >
              <UserCheck className="w-3.5 h-3.5" />
            </button>
          </Tip>
          <Tip label="Log Out">
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
          </Tip>
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

            {/* Category Pills + Favorites */}
            {categories.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => { setActiveCategory(null); setShowFavoritesOnly(false) }}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !activeCategory && !showFavoritesOnly
                      ? "bg-brand text-white"
                      : "bg-pos-card text-pos-muted border border-pos-border hover:text-pos-fg"
                  }`}
                >
                  All
                </button>
                {store.favorites.length > 0 && (
                  <button
                    onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); setActiveCategory(null) }}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                      showFavoritesOnly
                        ? "bg-yellow-500 text-white"
                        : "bg-pos-card text-pos-muted border border-pos-border hover:text-pos-fg"
                    }`}
                  >
                    <Star className="w-3 h-3" /> Favorites
                  </button>
                )}
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(activeCategory === cat.id ? null : cat.id); setShowFavoritesOnly(false) }}
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
                {/* Custom Item Button */}
                <button
                  onClick={() => setShowCustomItem(true)}
                  className="pos-card p-2.5 text-center hover:border-brand/40 transition-all flex flex-col items-center justify-center gap-2 border-dashed border-2 border-pos-border h-full min-h-[140px]"
                >
                  <PlusCircle className="w-8 h-8 text-brand" />
                  <p className="text-xs font-medium text-brand">Custom Item</p>
                </button>
                {products.flatMap((product) =>
                  (product.variants || []).map((variant) => ({ product, variant }))
                )
                .filter(({ variant }) => !showFavoritesOnly || store.favorites.includes(variant.id))
                .map(({ product, variant }) => {
                  const price = variant.prices?.find(
                    (p) => p.currency_code.toLowerCase() === currency.toLowerCase()
                  )
                  const isOutOfStock = variant.inventory_quantity != null && variant.inventory_quantity <= 0
                  const showVariantTitle = product.variants.length > 1
                  return (
                      <div key={variant.id} className="pos-card p-2.5 text-left transition-all group relative">
                      {/* Favorite star */}
                      <button
                        onClick={(e) => { e.stopPropagation(); store.toggleFavorite(variant.id) }}
                        className={`absolute top-1.5 right-1.5 z-10 p-1 rounded-full transition-colors ${store.isFavorite(variant.id) ? "text-yellow-500" : "text-pos-muted/30 hover:text-yellow-400"}`}
                        title="Toggle favorite"
                      >
                        <Star className={`w-3.5 h-3.5 ${store.isFavorite(variant.id) ? "fill-current" : ""}`} />
                      </button>
                      <button
                        onClick={() => addProductToCart(product, variant)}
                        disabled={isOutOfStock}
                        className={`w-full text-left cursor-pointer active:scale-[0.97] ${
                          isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                      <div className="aspect-square rounded-lg bg-pos-bg-subtle mb-2 overflow-hidden flex items-center justify-center relative">
                        {product.thumbnail ? (
                          <Image
                            src={product.thumbnail}
                            alt={product.title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                            className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
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
                              price.amount,
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
                    </div>
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
        onSettings={() => setShowSettings(true)}
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

      {/* Custom Item Modal */}
      {showCustomItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCustomItem(false)}>
          <div className="bg-pos-card border border-pos-border rounded-2xl w-full max-w-sm mx-4 shadow-modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-pos-border">
              <h2 className="text-lg font-bold text-pos-fg">Custom Item</h2>
              <button onClick={() => setShowCustomItem(false)} className="text-pos-muted hover:text-pos-fg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              className="p-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const name = (form.elements.namedItem("customName") as HTMLInputElement).value.trim()
                const priceStr = (form.elements.namedItem("customPrice") as HTMLInputElement).value
                const price = Math.round(parseFloat(priceStr) * 100) / 100
                if (!name || isNaN(price) || price <= 0) {
                  toast.error("Enter a valid name and price"); return
                }
                store.addItem({
                  id: `custom-${Date.now()}`,
                  variant_id: `custom-${Date.now()}`,
                  product_id: `custom-${Date.now()}`,
                  title: name,
                  variant_title: "Custom",
                  thumbnail: null,
                  quantity: 1,
                  unit_price: price,
                  currency_code: currency,
                  barcode: null,
                  sku: null,
                  inventory_quantity: null,
                })
                toast.success(`Added "${name}"`)
                setShowCustomItem(false)
              }}
            >
              <div>
                <label className="text-xs font-medium text-pos-muted block mb-1">Item Name</label>
                <input name="customName" placeholder="e.g. Gift Wrapping" className="w-full bg-pos-bg border border-pos-border rounded-lg px-3 py-2 text-sm text-pos-fg" autoFocus />
              </div>
              <div>
                <label className="text-xs font-medium text-pos-muted block mb-1">Price ({currency})</label>
                <input name="customPrice" type="number" step="0.01" min="0.01" placeholder="0.00" className="w-full bg-pos-bg border border-pos-border rounded-lg px-3 py-2 text-sm text-pos-fg" />
              </div>
              <button type="submit" className="pos-btn-success w-full">
                <Plus className="w-4 h-4" /> Add to Cart
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
          <div className="bg-pos-card border border-pos-border rounded-2xl w-full max-w-sm mx-4 shadow-modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-pos-border">
              <h2 className="text-lg font-bold text-pos-fg">POS Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-pos-muted hover:text-pos-fg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-pos-muted block mb-1">Daily Sales Target ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={store.dailyTarget > 0 ? Number(store.dailyTarget).toFixed(2) : ""}
                  placeholder="0 = disabled"
                  onChange={(e) => store.setDailyTarget(parseFloat(e.target.value || "0"))}
                  className="w-full bg-pos-bg border border-pos-border rounded-lg px-3 py-2 text-sm text-pos-fg"
                />
                <p className="text-[10px] text-pos-muted mt-1">Set 0 to disable the sales goal tracker</p>
              </div>
              <div>
                <label className="text-xs font-medium text-pos-muted block mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  defaultValue={store.taxRate > 0 ? store.taxRate : ""}
                  placeholder="0 = no tax"
                  onChange={(e) => store.setTaxRate(parseFloat(e.target.value || "0"))}
                  className="w-full bg-pos-bg border border-pos-border rounded-lg px-3 py-2 text-sm text-pos-fg"
                />
                <p className="text-[10px] text-pos-muted mt-1">Applied automatically to all sales (e.g. 12.5 for VAT/NHIL)</p>
              </div>
              <button onClick={() => { setShowSettings(false); toast.success("Settings saved") }} className="pos-btn-success w-full">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </Tooltip.Provider>
  )
}

// ─── Tooltip helper ──────────────────────────────────────────────────────────

function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="bottom"
          sideOffset={4}
          className="z-[200] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md px-2 py-1 text-xs shadow-md pointer-events-none"
        >
          {label}
          <Tooltip.Arrow className="fill-zinc-900 dark:fill-zinc-100" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
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
        <div className="w-10 h-10 rounded-md bg-pos-card flex items-center justify-center shrink-0 overflow-hidden relative">
          {item.thumbnail ? (
            <Image src={item.thumbnail} alt="" fill sizes="40px" className="object-cover" />
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
            <div className="flex items-center gap-1.5">
              <span>
                Cart Discount
                {store.cartDiscount?.type === "percentage" && ` (${store.cartDiscount.value}%)`}
              </span>
              <button
                onClick={() => store.setCartDiscount(null)}
                className="w-4 h-4 rounded-full bg-orange-600/20 hover:bg-orange-600/40 transition-colors flex items-center justify-center"
                title="Remove cart discount"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
            <span>-{formatCurrency(cartDiscountAmt, currency)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold text-pos-fg pt-1.5 border-t border-pos-border">
          <span>Subtotal</span>
          <span>{formatCurrency(total, currency)}</span>
        </div>
        {store.taxRate > 0 && (
          <div className="flex justify-between text-sm text-pos-muted">
            <span>Tax ({store.taxRate}%)</span>
            <span>+{formatCurrency(total * store.taxRate / 100, currency)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold text-brand pt-1">
          <span>Total</span>
          <span>{formatCurrency(total + (total * store.taxRate / 100), currency)}</span>
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

type PayMethod = "cash" | "paystack" | "merchant_momo" | "telecel_agent"

interface SplitEntry {
  id: string
  method: PayMethod
  amount: number
  label: string
  meta?: Record<string, string>
}

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

  // Telecel Agent fields
  const [agentCode, setAgentCode] = useState("")
  const [agentPhone, setAgentPhone] = useState("")
  const [agentTxnRef, setAgentTxnRef] = useState("")

  // Split payment
  const [splitMode, setSplitMode] = useState(false)
  const [splitEntries, setSplitEntries] = useState<SplitEntry[]>([])
  const [splitAmount, setSplitAmount] = useState("")

  // Make sure Paystack script is always loaded when Payment Modal is open
  usePaystack()

  const cashAmount = parseFloat(cashReceived) || 0
  const change = Math.max(0, cashAmount - total)

  // Split derived
  const totalPaid = splitEntries.reduce((s, e) => s + e.amount, 0)
  const splitRemaining = Math.max(0, total - totalPaid)
  const splitDone = splitRemaining < 0.005
  const splitEntryAmt = parseFloat(splitAmount) || 0

  const merchantMomoNumber = process.env.NEXT_PUBLIC_MERCHANT_MOMO_NUMBER || "Not configured"

  const canPaySingle =
    method === "cash" ? cashAmount >= total
    : method === "paystack" ? true
    : method === "merchant_momo" ? true
    : method === "telecel_agent" ? agentCode.trim().length > 0 && agentPhone.length >= 10
    : false

  const canPay = splitMode ? (splitDone && !processing) : (canPaySingle && !processing)

  const canAddSplit = !processing && !splitDone && splitEntryAmt > 0.009 && splitEntryAmt <= splitRemaining + 0.005 &&
    (method !== "telecel_agent" || (agentCode.trim().length > 0 && agentPhone.length >= 10))

  // ── Create draft order in Medusa ────────────────────────────────────────────
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

  // ── Build receipt data ────────────────────────────────────────────────
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
    const receipt = buildReceipt("Cash", { cashReceived: cashAmount, change })
    playPurchaseSuccess()
    setProcessing(false)
    onComplete("Cash", receipt)
  }

  // ── Handle Paystack Inline (Popup) ────────────────────────────────────────────
  const handlePaystackPay = async () => {
    setProcessing(true)
    setError("")
    setStatusText("Opening Paystack checkout...")
    try {
      const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
      if (!publicKey) throw new Error("Paystack Public Key missing. Add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY to .env.local")
      if (typeof window === "undefined" || !window.PaystackPop) throw new Error("Paystack is still loading. Please try again.")

      const email = customer?.email || "pos@letscase.com"
      const reference = `pos-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const providerName = "Paystack"

      window.PaystackPop.setup({
        key: publicKey, email,
        amount: Math.round(total * 100),
        currency: "GHS", reference,
        channels: ["mobile_money", "card"],
        metadata: { custom_fields: [
          { display_name: "Source", variable_name: "source", value: "POS" },
          { display_name: "Staff", variable_name: "staff", value: staffName },
        ]},
        callback: (transaction: any) => {
          setStatusText("Payment confirmed! Creating order...")
          createOrder("paystack", { paystack_reference: transaction.reference })
            .then(() => {
              const receipt = buildReceipt(providerName, {
                note: cartNote ? `${cartNote} | Ref: ${transaction.reference}` : `Ref: ${transaction.reference}`,
              })
              playPurchaseSuccess()
              setProcessing(false)
              onComplete(providerName, receipt)
            })
            .catch((err: any) => { setProcessing(false); setError(err.message || "Failed to sync order") })
        },
        onClose: () => { setProcessing(false); setStatusText(""); toast.error("Payment modal closed") },
      }).openIframe()
    } catch (err: any) {
      setProcessing(false); setStatusText("")
      setError(err.message || "Failed to load Paystack")
      toast.error(err.message || "Failed to load Paystack")
    }
  }

  // ── Handle Merchant MoMo (manual) ─────────────────────────────────────────
  const handleMerchantMomoPay = async () => {
    setProcessing(true); setError("")
    await createOrder("merchant_momo")
    const receipt = buildReceipt("Merchant MoMo")
    playPurchaseSuccess()
    setProcessing(false)
    onComplete("Merchant MoMo", receipt)
  }

  // ── Handle Telecel Agent (manual tracking) ───────────────────────────────────────────
  const handleAgentPay = async () => {
    setProcessing(true); setError("")
    await createOrder("telecel_agent", {
      agent_code: agentCode.trim(), agent_phone: agentPhone.trim(), agent_txn_ref: agentTxnRef.trim(),
    })
    const receipt = buildReceipt("Telecel Agent", {
      note: [cartNote, `Agent: ${agentCode}`, `Agent Phone: ${agentPhone}`, agentTxnRef ? `Txn Ref: ${agentTxnRef}` : ""]
        .filter(Boolean).join(" | "),
    })
    playPurchaseSuccess()
    setProcessing(false)
    onComplete("Telecel Agent", receipt)
  }

  // ── Add split payment entry ─────────────────────────────────────────────────
  const handleAddSplitEntry = useCallback(async () => {
    if (!canAddSplit) return
    const amt = parseFloat(splitAmount) || 0

    if (method === "paystack") {
      setProcessing(true); setStatusText("Opening Paystack checkout...")
      try {
        const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
        if (!publicKey || !window.PaystackPop) throw new Error("Paystack not ready")
        const reference = `pos-split-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        window.PaystackPop.setup({
          key: publicKey, email: customer?.email || "pos@letscase.com",
          amount: Math.round(amt * 100), currency: "GHS", reference,
          channels: ["mobile_money", "card"],
          callback: (transaction: any) => {
            setSplitEntries(prev => [...prev, { id: transaction.reference, method: "paystack", amount: amt, label: "Paystack", meta: { paystack_reference: transaction.reference } }])
            setSplitAmount("")
            setProcessing(false); setStatusText("")
            toast.success(`Paystack — ${formatCurrency(amt, currency)} added`)
          },
          onClose: () => { setProcessing(false); setStatusText(""); toast("Paystack payment cancelled") },
        }).openIframe()
      } catch (err: any) { setProcessing(false); setStatusText(""); setError(err.message || "Paystack error") }
      return
    }

    const methodLabels: Record<PayMethod, string> = { cash: "Cash", paystack: "Paystack", merchant_momo: "Merchant MoMo", telecel_agent: "Telecel Agent" }
    const label = methodLabels[method]
    const meta = method === "telecel_agent" && agentCode.trim()
      ? { agent_code: agentCode.trim(), agent_phone: agentPhone.trim(), agent_txn_ref: agentTxnRef.trim() }
      : undefined
    setSplitEntries(prev => [...prev, { id: `split-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, method, amount: amt, label, ...(meta ? { meta } : {}) }])
    setSplitAmount("")
    toast.success(`${label} — ${formatCurrency(amt, currency)} added`)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAddSplit, method, splitAmount, customer, currency, agentCode, agentPhone, agentTxnRef])

  // ── Complete split payment ──────────────────────────────────────────────────
  const handleCompleteSplitPayment = async () => {
    setProcessing(true); setError("")
    const methodLabel = [...new Set(splitEntries.map(e => e.label))].join(" + ")
    const combinedMeta: Record<string, string> = {}
    splitEntries.forEach((e, i) => {
      combinedMeta[`split_${i}_method`] = e.method
      combinedMeta[`split_${i}_amount`] = String(e.amount)
      if (e.meta) Object.entries(e.meta).forEach(([k, v]) => { combinedMeta[`split_${i}_${k}`] = v })
    })
    await createOrder(methodLabel, combinedMeta)
    const receipt = buildReceipt(methodLabel, {
      splitPayments: splitEntries.map(e => ({ method: e.label, amount: e.amount }))
    })
    playPurchaseSuccess()
    setProcessing(false)
    onComplete(methodLabel, receipt)
  }

  const handlePay = useCallback(() => {
    if (splitMode) { handleCompleteSplitPayment(); return }
    if (method === "cash") return handleCashPay()
    if (method === "paystack") return handlePaystackPay()
    if (method === "merchant_momo") return handleMerchantMomoPay()
    if (method === "telecel_agent") return handleAgentPay()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitMode, method, cashAmount, total, agentCode, agentPhone, agentTxnRef, splitEntries, splitDone])

  // Enter key to submit payment
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && canPay && !processing) { e.preventDefault(); handlePay() }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [canPay, processing, handlePay])

  // Quick cash buttons
  const quickAmounts = [
    total,
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 20) * 20,
    Math.ceil(total / 50) * 50,
    Math.ceil(total / 100) * 100,
  ].filter((v, i, a) => a.indexOf(v) === i && v >= total)

  const methodTabs: Array<{ key: PayMethod; label: string; icon: React.ReactNode }> = [
    { key: "cash", label: "Cash", icon: <DollarSign className="w-4 h-4" /> },
    { key: "paystack", label: "Paystack", icon: <Smartphone className="w-4 h-4" /> },
    { key: "merchant_momo", label: "MoMo Pay", icon: <PhoneCall className="w-4 h-4" /> },
    { key: "telecel_agent", label: "Agent", icon: <Users className="w-4 h-4" /> },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={processing ? undefined : onClose}>
      <div className="bg-pos-card border border-pos-border rounded-2xl w-full max-w-md mx-4 shadow-modal max-h-[90dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-pos-border sticky top-0 bg-pos-card z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-pos-fg">Payment</h2>
          <button onClick={onClose} className="text-pos-muted hover:text-pos-fg" disabled={processing}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 space-y-4">
          {/* Total */}
          <div className="text-center">
            <p className="text-pos-muted text-sm">Total Amount</p>
            <p className="text-3xl font-bold text-brand">{formatCurrency(total, currency)}</p>
          </div>

          {/* Split toggle */}
          <div className="flex items-center justify-between bg-pos-bg-subtle rounded-xl px-3 py-2">
            <div className="flex items-center gap-2 text-sm text-pos-muted">
              <Split className="w-4 h-4" />
              <span className="font-medium text-pos-fg">Split Payment</span>
              <span className="text-xs hidden sm:inline">— multiple methods</span>
            </div>
            <button
              onClick={() => { const n = !splitMode; setSplitMode(n); setSplitEntries([]); setSplitAmount(n ? total.toFixed(2) : ""); setError("") }}
              disabled={processing}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${splitMode ? "bg-brand" : "bg-pos-border"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${splitMode ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          {/* Payment Method Tabs */}
          <div className="grid grid-cols-4 gap-1.5">
            {methodTabs.map((m) => (
              <button
                key={m.key}
                onClick={() => { setMethod(m.key); setError(""); setStatusText(""); if (splitMode) setSplitAmount(splitRemaining.toFixed(2)) }}
                disabled={processing}
                className={`p-2 rounded-xl border text-center transition-all ${
                  method === m.key ? "border-brand bg-brand/10 text-brand" : "border-pos-border text-pos-muted hover:text-pos-fg"
                }`}
              >
                <div className="mx-auto mb-0.5 flex justify-center">{m.icon}</div>
                <span className="text-[11px] font-medium leading-tight">{m.label}</span>
              </button>
            ))}
          </div>

          {/* ── Single-mode panels (hidden when split mode is active) ────────────────── */}
          {!splitMode && method === "cash" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-pos-muted mb-1">Cash Received</label>
                <input type="text" inputMode="decimal" value={cashReceived}
                  onChange={(e) => { const v = e.target.value; if (v === "" || /^\d*\.?\d{0,2}$/.test(v)) setCashReceived(v) }}
                  className="pos-input w-full text-xl text-center h-14 font-bold" placeholder="0.00" autoFocus />
              </div>
              <div className="flex gap-2 flex-wrap">
                {quickAmounts.map((amt) => (
                  <button key={amt} onClick={() => setCashReceived(Number(amt).toFixed(2))}
                    className="flex-1 min-w-[30%] py-2 px-3 border border-pos-border rounded-xl text-center font-bold text-pos-fg hover-subtle transition-colors shrink-0">
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

          {!splitMode && method === "paystack" && (
            <div className="space-y-3 text-center">
              <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-6">
                <Smartphone className="w-10 h-10 text-teal-600 dark:text-teal-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-teal-800 dark:text-teal-200">Pay with Mobile Money or Card</p>
                <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 max-w-[250px] mx-auto">A secure Paystack popup will open to process the payment directly on this device.</p>
              </div>
            </div>
          )}

          {!splitMode && method === "merchant_momo" && (
            <div className="space-y-3 text-center">
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-5">
                <PhoneCall className="w-10 h-10 text-orange-600 dark:text-orange-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">Merchant MoMo Payment</p>
                <p className="text-xs text-orange-700 dark:text-orange-300">Ask the customer to send</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 my-2">{formatCurrency(total, currency)}</p>
                <p className="text-xs text-orange-700 dark:text-orange-300 mb-1">to this number:</p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400 tracking-wider">{merchantMomoNumber}</p>
                <p className="text-[10px] text-orange-600/70 dark:text-orange-400/70 mt-2">Confirm receipt on your phone before clicking Complete Payment</p>
              </div>
            </div>
          )}

          {!splitMode && method === "telecel_agent" && (
            <div className="space-y-3">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-xs text-red-700 dark:text-red-300 font-semibold mb-1">Telecel Agent Payment</p>
                <p className="text-[10px] text-red-700/70 dark:text-red-300/70">Record payment details from the Telecel agent transaction. The agent dials *110# and processes the payment using their agent SIM.</p>
              </div>
              <div><label className="block text-xs text-pos-muted mb-1">Agent Code *</label>
                <input type="text" value={agentCode} onChange={(e) => setAgentCode(e.target.value)} className="pos-input w-full" placeholder="e.g. TC-12345" autoFocus /></div>
              <div><label className="block text-xs text-pos-muted mb-1">Agent Phone Number *</label>
                <input type="tel" value={agentPhone} onChange={(e) => setAgentPhone(e.target.value)} className="pos-input w-full" placeholder="050 123 4567" /></div>
              <div><label className="block text-xs text-pos-muted mb-1">Transaction Reference (from SMS)</label>
                <input type="text" value={agentTxnRef} onChange={(e) => setAgentTxnRef(e.target.value)} className="pos-input w-full" placeholder="Optional — enter the reference from the confirmation SMS" /></div>
            </div>
          )}

          {/* ── Split Mode UI ────────────────────────────────────────────────── */}
          {splitMode && (
            <div className="space-y-3">
              {splitEntries.length > 0 && (
                <div className="bg-pos-bg rounded-xl p-3 space-y-1.5">
                  {splitEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          entry.method === "cash" ? "bg-emerald-500"
                          : entry.method === "paystack" ? "bg-teal-500"
                          : entry.method === "merchant_momo" ? "bg-orange-500"
                          : "bg-red-500"
                        }`} />
                        <span className="text-pos-fg font-medium">{entry.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-pos-fg font-semibold">{formatCurrency(entry.amount, currency)}</span>
                        <button
                          onClick={() => { setSplitEntries(prev => prev.filter(e => e.id !== entry.id)); setSplitAmount((splitRemaining + entry.amount).toFixed(2)) }}
                          className="text-pos-muted hover:text-red-500 transition-colors"
                        ><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-pos-border pt-1.5 flex justify-between text-sm font-bold">
                    <span className="text-pos-muted">Remaining</span>
                    <span className={splitDone ? "text-emerald-600 dark:text-emerald-400" : "text-brand"}>
                      {splitDone ? "✔ Fully Paid" : formatCurrency(splitRemaining, currency)}
                    </span>
                  </div>
                </div>
              )}

              {!splitDone && (
                <div className="space-y-2">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-xs text-pos-muted block mb-1">
                        Amount ({method === "cash" ? "Cash" : method === "paystack" ? "Paystack" : method === "merchant_momo" ? "MoMo" : "Agent"})
                      </label>
                      <input type="text" inputMode="decimal" value={splitAmount}
                        onChange={(e) => { const v = e.target.value; if (v === "" || /^\d*\.?\d{0,2}$/.test(v)) setSplitAmount(v) }}
                        className="pos-input w-full text-center font-bold" placeholder={splitRemaining.toFixed(2)} />
                    </div>
                    <button onClick={handleAddSplitEntry} disabled={!canAddSplit} className="pos-btn-primary h-10 px-4 shrink-0">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  {method === "merchant_momo" && splitAmount && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 text-center">
                      Customer sends {formatCurrency(parseFloat(splitAmount) || 0, currency)} to <strong>{merchantMomoNumber}</strong>
                    </p>
                  )}
                  {method === "telecel_agent" && (
                    <div className="space-y-1.5">
                      <input type="text" value={agentCode} onChange={(e) => setAgentCode(e.target.value)} className="pos-input w-full text-xs" placeholder="Agent Code *" />
                      <input type="tel" value={agentPhone} onChange={(e) => setAgentPhone(e.target.value)} className="pos-input w-full text-xs" placeholder="Agent Phone Number *" />
                      <input type="text" value={agentTxnRef} onChange={(e) => setAgentTxnRef(e.target.value)} className="pos-input w-full text-xs" placeholder="Transaction Ref (optional)" />
                    </div>
                  )}
                </div>
              )}
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

          <button onClick={handlePay} disabled={!canPay || processing} className="pos-btn-success w-full h-12 text-base font-bold">
            {processing ? <Loader2 className="w-5 h-5 animate-spin" />
              : splitMode && splitDone ? <>Complete Split Payment</>
              : <>Complete Payment</>}
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
      <div className="bg-pos-card border border-pos-border rounded-2xl w-full max-w-sm mx-4 shadow-modal max-h-[90dvh] flex flex-col" onClick={(e) => e.stopPropagation()}>
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
      const fixedVal = numVal
      store.setItemDiscount(targetItemId, type, fixedVal)
      toast.success("Item discount applied")
    } else {
      const fixedVal = numVal
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
            placeholder={type === "percentage" ? "10" : "5"}
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
      <div className="bg-pos-card border border-pos-border rounded-2xl w-full max-w-md mx-4 shadow-modal max-h-[80dvh] flex flex-col" onClick={(e) => e.stopPropagation()}>
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
                      if (store.heldSales.length === 0) onClose()
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
  onSettings,
}: {
  can: (p: Parameters<typeof hasPermission>[1]) => boolean
  store: POSState
  router: any
  onOpenCart: () => void
  onSettings: () => void
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
            <button onClick={() => { setShowMore(false); router.push("/pin-login") }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-pos-fg hover-subtle transition-colors">
              <UserCheck className="w-4 h-4 text-pos-muted" /> Switch Staff
            </button>
            <button onClick={() => { setShowMore(false); onSettings() }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-pos-fg hover-subtle transition-colors">
              <Settings className="w-4 h-4 text-pos-muted" /> Settings
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
        {can("pos.reports") && (
          <button onClick={() => router.push("/reports")} className="mobile-nav-item">
            <BarChart3 className="w-5 h-5" />
            <span>Reports</span>
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
