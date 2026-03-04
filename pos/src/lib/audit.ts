"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

// ─── Types ───────────────────────────────────────────────────────────────────

export type AuditAction =
  | "login"
  | "logout"
  | "shift_open"
  | "shift_close"
  | "sale_complete"
  | "sale_void"
  | "refund"
  | "discount_item"
  | "discount_cart"
  | "drawer_open"
  | "drawer_cash_in"
  | "drawer_cash_out"
  | "customer_create"
  | "held_sale"
  | "held_sale_restore"
  | "held_sale_delete"
  | "pin_login"
  | "role_change"

export interface AuditEntry {
  id: string
  action: AuditAction
  staffName: string
  staffRole: string
  detail: string
  timestamp: string
  metadata?: Record<string, unknown>
}

interface AuditState {
  entries: AuditEntry[]
  addEntry: (entry: Omit<AuditEntry, "id" | "timestamp">) => void
  clearEntries: () => void
  getEntriesByDate: (date: string) => AuditEntry[]
  getEntriesByStaff: (staffName: string) => AuditEntry[]
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (entry) => {
        const newEntry: AuditEntry = {
          ...entry,
          id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
        }
        set({ entries: [...get().entries, newEntry] })
      },

      clearEntries: () => set({ entries: [] }),

      getEntriesByDate: (date) => {
        const dayStart = new Date(date)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(date)
        dayEnd.setHours(23, 59, 59, 999)
        return get().entries.filter((e) => {
          const t = new Date(e.timestamp)
          return t >= dayStart && t <= dayEnd
        })
      },

      getEntriesByStaff: (staffName) => {
        return get().entries.filter((e) => e.staffName === staffName)
      },
    }),
    {
      name: "letscase-pos-audit",
      partialize: (state) => ({
        entries: state.entries.slice(-500), // Keep last 500 entries to avoid bloating localStorage
      }),
    }
  )
)

// ─── Helper ──────────────────────────────────────────────────────────────────

export function getActionLabel(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    login: "Login",
    logout: "Logout",
    shift_open: "Shift Opened",
    shift_close: "Shift Closed",
    sale_complete: "Sale Completed",
    sale_void: "Sale Voided",
    refund: "Refund Processed",
    discount_item: "Item Discount Applied",
    discount_cart: "Cart Discount Applied",
    drawer_open: "Cash Drawer Opened",
    drawer_cash_in: "Cash In",
    drawer_cash_out: "Cash Out",
    customer_create: "Customer Created",
    held_sale: "Sale Held",
    held_sale_restore: "Held Sale Restored",
    held_sale_delete: "Held Sale Deleted",
    pin_login: "PIN Login",
    role_change: "Role Changed",
  }
  return labels[action] || action
}

export function getActionColor(action: AuditAction): string {
  switch (action) {
    case "sale_complete": return "text-emerald-600 dark:text-emerald-400"
    case "refund": case "sale_void": return "text-red-600 dark:text-red-400"
    case "discount_item": case "discount_cart": return "text-orange-600 dark:text-orange-400"
    case "login": case "logout": case "pin_login": return "text-teal-600 dark:text-teal-400"
    case "shift_open": case "shift_close": case "role_change": return "text-amber-600 dark:text-amber-400"
    case "drawer_open": case "drawer_cash_in": case "drawer_cash_out": return "text-purple-600 dark:text-purple-400"
    default: return "text-pos-muted"
  }
}
