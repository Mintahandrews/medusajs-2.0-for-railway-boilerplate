"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { POSRole } from "@/lib/rbac"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface POSCartItem {
  id: string
  variant_id: string
  product_id: string
  title: string
  variant_title: string
  thumbnail: string | null
  quantity: number
  unit_price: number // in smallest currency unit (pesewas)
  currency_code: string
  barcode: string | null
  sku: string | null
  discount_amount: number // per-item discount in smallest unit
  discount_type: "percentage" | "fixed" | null
  discount_value: number // raw value (e.g. 10 for 10% or 500 for GHS 5)
  note: string
  inventory_quantity: number | null
}

export interface HeldSale {
  id: string
  items: POSCartItem[]
  customer: any | null
  note: string
  created_at: string
  staff_name: string
}

export interface CashDrawerEntry {
  id: string
  type: "cash_in" | "cash_out" | "sale" | "refund" | "open" | "close"
  amount: number
  note: string
  timestamp: string
  order_id?: string
}

export interface POSState {
  // Cart
  items: POSCartItem[]
  customer: any | null
  cartNote: string
  cartDiscount: { type: "percentage" | "fixed"; value: number } | null

  // Held sales
  heldSales: HeldSale[]

  // Cash drawer
  drawerEntries: CashDrawerEntry[]
  drawerOpen: boolean

  // Session
  staffName: string
  staffRole: POSRole
  staffUserId: string
  staffEmail: string
  shiftStart: string | null

  // Settings
  favorites: string[] // variant IDs
  dailyTarget: number // in minor units (pesewas), 0 = disabled
  taxRate: number // percentage, 0 = disabled

  // Actions — Cart
  addItem: (item: Omit<POSCartItem, "discount_amount" | "discount_type" | "discount_value" | "note">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  setItemDiscount: (id: string, type: "percentage" | "fixed", value: number) => void
  clearItemDiscount: (id: string) => void
  setItemNote: (id: string, note: string) => void
  setCustomer: (customer: any | null) => void
  setCartNote: (note: string) => void
  setCartDiscount: (discount: { type: "percentage" | "fixed"; value: number } | null) => void
  clearCart: () => void

  // Actions — Held Sales
  holdCurrentSale: (staffName: string) => void
  restoreHeldSale: (id: string) => void
  removeHeldSale: (id: string) => void

  // Actions — Cash Drawer
  addDrawerEntry: (entry: Omit<CashDrawerEntry, "id" | "timestamp">) => void
  setDrawerOpen: (open: boolean) => void
  clearDrawerEntries: () => void

  // Actions — Session
  setStaffName: (name: string) => void
  setStaffRole: (role: POSRole) => void
  setStaffUserId: (id: string) => void
  setStaffEmail: (email: string) => void
  setSession: (session: { staffName: string; staffRole: POSRole; staffUserId: string; staffEmail: string }) => void
  clearSession: () => void
  startShift: () => void
  endShift: () => void

  // Actions — Settings
  toggleFavorite: (variantId: string) => void
  isFavorite: (variantId: string) => boolean
  setDailyTarget: (amount: number) => void
  setTaxRate: (rate: number) => void

  // Computed
  getSubtotal: () => number
  getItemTotal: (item: POSCartItem) => number
  getCartDiscountAmount: () => number
  getTotal: () => number
  getItemCount: () => number
  getDrawerBalance: () => number
}

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      customer: null,
      cartNote: "",
      cartDiscount: null,
      heldSales: [],
      drawerEntries: [],
      drawerOpen: false,
      staffName: "",
      staffRole: "cashier" as POSRole,
      staffUserId: "",
      staffEmail: "",
      shiftStart: null,
      favorites: [],
      dailyTarget: 0,
      taxRate: 0,

      // ─── Cart Actions ────────────────────────────────────────────────

      addItem: (item) => {
        const { items } = get()
        const existing = items.find((i) => i.variant_id === item.variant_id)

        if (existing) {
          set({
            items: items.map((i) =>
              i.variant_id === item.variant_id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          })
        } else {
          set({
            items: [
              ...items,
              {
                ...item,
                discount_amount: 0,
                discount_type: null,
                discount_value: 0,
                note: "",
              },
            ],
          })
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        const item = get().items.find((i) => i.id === id)
        if (item && item.inventory_quantity != null && quantity > item.inventory_quantity) {
          return // Prevent exceeding available stock
        }
        set({
          items: get().items.map((i) => {
            if (i.id !== id) return i
            const updated = { ...i, quantity }
            // Recalculate discount_amount for percentage discounts
            if (updated.discount_type === "percentage") {
              updated.discount_amount = Math.round(
                (updated.unit_price * quantity * updated.discount_value) / 100
              )
            }
            return updated
          }),
        })
      },

      setItemDiscount: (id, type, value) => {
        set({
          items: get().items.map((i) => {
            if (i.id !== id) return i
            const discountAmount =
              type === "percentage"
                ? parseFloat(((i.unit_price * i.quantity * value) / 100).toFixed(2))
                : value
            return {
              ...i,
              discount_type: type,
              discount_value: value,
              discount_amount: discountAmount,
            }
          }),
        })
      },

      clearItemDiscount: (id) => {
        set({
          items: get().items.map((i) =>
            i.id === id
              ? { ...i, discount_type: null, discount_value: 0, discount_amount: 0 }
              : i
          ),
        })
      },

      setItemNote: (id, note) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, note } : i
          ),
        })
      },

      setCustomer: (customer) => set({ customer }),
      setCartNote: (cartNote) => set({ cartNote }),
      setCartDiscount: (cartDiscount) => set({ cartDiscount }),

      clearCart: () =>
        set({
          items: [],
          customer: null,
          cartNote: "",
          cartDiscount: null,
        }),

      // ─── Held Sales ──────────────────────────────────────────────────

      holdCurrentSale: (staffName) => {
        const { items, customer, cartNote, heldSales } = get()
        if (!items.length) return

        const held: HeldSale = {
          id: `held-${Date.now()}`,
          items: [...items],
          customer,
          note: cartNote,
          created_at: new Date().toISOString(),
          staff_name: staffName,
        }

        set({
          heldSales: [...heldSales, held],
          items: [],
          customer: null,
          cartNote: "",
          cartDiscount: null,
        })
      },

      restoreHeldSale: (id) => {
        const sale = get().heldSales.find((s) => s.id === id)
        if (!sale) return

        // Hold current cart first if it has items
        const { items: currentItems } = get()
        if (currentItems.length > 0) {
          get().holdCurrentSale(get().staffName)
        }

        // Read fresh heldSales AFTER holdCurrentSale to include the newly held sale
        const freshHeldSales = get().heldSales

        set({
          items: sale.items,
          customer: sale.customer,
          cartNote: sale.note,
          heldSales: freshHeldSales.filter((s) => s.id !== id),
        })
      },

      removeHeldSale: (id) => {
        set({
          heldSales: get().heldSales.filter((s) => s.id !== id),
        })
      },

      // ─── Cash Drawer ─────────────────────────────────────────────────

      addDrawerEntry: (entry) => {
        set({
          drawerEntries: [
            ...get().drawerEntries,
            {
              ...entry,
              id: `drawer-${Date.now()}`,
              timestamp: new Date().toISOString(),
            },
          ],
        })
      },

      setDrawerOpen: (open) => set({ drawerOpen: open }),

      clearDrawerEntries: () => set({ drawerEntries: [] }),

      // ─── Session ──────────────────────────────────────────────────────

      setStaffName: (staffName) => set({ staffName }),
      setStaffRole: (staffRole) => set({ staffRole }),
      setStaffUserId: (staffUserId) => set({ staffUserId }),
      setStaffEmail: (staffEmail) => set({ staffEmail }),

      setSession: ({ staffName, staffRole, staffUserId, staffEmail }) =>
        set({ staffName, staffRole, staffUserId, staffEmail }),

      clearSession: () =>
        set({
          staffName: "",
          staffRole: "cashier" as POSRole,
          staffUserId: "",
          staffEmail: "",
          shiftStart: null,
        }),

      startShift: () =>
        set({
          shiftStart: new Date().toISOString(),
          drawerEntries: [],
        }),

      endShift: () => set({ shiftStart: null }),

      // ─── Settings ──────────────────────────────────────────────────────

      toggleFavorite: (variantId) => {
        const { favorites } = get()
        if (favorites.includes(variantId)) {
          set({ favorites: favorites.filter((id) => id !== variantId) })
        } else {
          set({ favorites: [...favorites, variantId] })
        }
      },

      isFavorite: (variantId) => get().favorites.includes(variantId),

      setDailyTarget: (dailyTarget) => set({ dailyTarget }),

      setTaxRate: (taxRate) => set({ taxRate }),

      // ─── Computed ─────────────────────────────────────────────────────

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.unit_price * item.quantity,
          0
        )
      },

      getItemTotal: (item) => {
        return item.unit_price * item.quantity - item.discount_amount
      },

      getCartDiscountAmount: () => {
        const { cartDiscount } = get()
        if (!cartDiscount) return 0
        const subtotal = get().getSubtotal()
        const itemDiscounts = get().items.reduce(
          (sum, i) => sum + i.discount_amount,
          0
        )
        const afterItemDiscounts = subtotal - itemDiscounts
        if (cartDiscount.type === "percentage") {
          return parseFloat(((afterItemDiscounts * cartDiscount.value) / 100).toFixed(2))
        }
        return cartDiscount.value
      },

      getTotal: () => {
        const subtotal = get().getSubtotal()
        const itemDiscounts = get().items.reduce(
          (sum, i) => sum + i.discount_amount,
          0
        )
        const cartDiscountAmount = get().getCartDiscountAmount()
        return Math.max(0, subtotal - itemDiscounts - cartDiscountAmount)
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      getDrawerBalance: () => {
        return get().drawerEntries.reduce((balance, entry) => {
          if (entry.type === "cash_in" || entry.type === "sale" || entry.type === "open") {
            return balance + entry.amount
          }
          if (entry.type === "cash_out" || entry.type === "refund") {
            return balance - entry.amount
          }
          return balance
        }, 0)
      },
    }),
    {
      name: "letscase-pos-store",
      partialize: (state) => ({
        items: state.items,
        customer: state.customer,
        cartNote: state.cartNote,
        cartDiscount: state.cartDiscount,
        heldSales: state.heldSales,
        drawerEntries: state.drawerEntries,
        drawerOpen: state.drawerOpen,
        staffName: state.staffName,
        staffRole: state.staffRole,
        staffUserId: state.staffUserId,
        staffEmail: state.staffEmail,
        shiftStart: state.shiftStart,
        favorites: state.favorites,
        dailyTarget: state.dailyTarget,
        taxRate: state.taxRate,
      }),
    }
  )
)
