/**
 * Role-Based Access Control (RBAC) for the POS system.
 *
 * Roles are stored in the Medusa admin user's metadata as `pos_role`.
 * Default role for users without metadata is "cashier".
 *
 * Roles hierarchy: admin > manager > cashier
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type POSRole = "admin" | "manager" | "cashier"

export type POSPermission =
  | "pos.sell"                  // Ring up sales
  | "pos.discount.item_small"   // Apply item discount ≤10%
  | "pos.discount.item_large"   // Apply item discount >10%
  | "pos.discount.cart"         // Apply cart-wide discount
  | "pos.refund"               // Process refunds
  | "pos.void_sale"            // Void / cancel a completed sale
  | "pos.reports"              // View reports & analytics
  | "pos.transactions"         // View transaction history
  | "pos.transactions.all"     // View ALL staff transactions (not just own)
  | "pos.drawer.open"          // Open cash drawer without a sale
  | "pos.customers"            // Manage customers
  | "pos.hold_sale"            // Hold / restore sales
  | "pos.audit_log"            // View audit log
  | "pos.settings"             // Change POS settings
  | "pos.manage_staff"         // Manage staff / roles
  | "pos.shift_report"         // View / print shift (Z) reports

// ─── Permission Matrix ───────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<POSRole, POSPermission[]> = {
  cashier: [
    "pos.sell",
    "pos.discount.item_small",
    "pos.customers",
    "pos.hold_sale",
    "pos.transactions",
  ],
  manager: [
    "pos.sell",
    "pos.discount.item_small",
    "pos.discount.item_large",
    "pos.discount.cart",
    "pos.refund",
    "pos.void_sale",
    "pos.reports",
    "pos.transactions",
    "pos.transactions.all",
    "pos.drawer.open",
    "pos.customers",
    "pos.hold_sale",
    "pos.shift_report",
  ],
  admin: [
    "pos.sell",
    "pos.discount.item_small",
    "pos.discount.item_large",
    "pos.discount.cart",
    "pos.refund",
    "pos.void_sale",
    "pos.reports",
    "pos.transactions",
    "pos.transactions.all",
    "pos.drawer.open",
    "pos.customers",
    "pos.hold_sale",
    "pos.audit_log",
    "pos.settings",
    "pos.manage_staff",
    "pos.shift_report",
  ],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function hasPermission(role: POSRole, permission: POSPermission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function getPermissions(role: POSRole): POSPermission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

export function getRoleLabel(role: POSRole): string {
  switch (role) {
    case "admin": return "Admin"
    case "manager": return "Manager"
    case "cashier": return "Cashier"
    default: return "Unknown"
  }
}

export function getRoleColor(role: POSRole): string {
  switch (role) {
    case "admin": return "text-red-600 dark:text-red-400"
    case "manager": return "text-amber-600 dark:text-amber-400"
    case "cashier": return "text-teal-600 dark:text-teal-400"
    default: return "text-pos-muted"
  }
}

export function getRoleBadgeClasses(role: POSRole): string {
  switch (role) {
    case "admin": return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
    case "manager": return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
    case "cashier": return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30"
    default: return "bg-pos-surface text-pos-muted border-pos-border"
  }
}

/**
 * Extract POS role from Medusa admin user object.
 * Falls back to "cashier" if not set.
 */
export function extractRoleFromUser(user: any): POSRole {
  const role = user?.metadata?.pos_role
  if (role === "admin" || role === "manager" || role === "cashier") {
    return role
  }
  return "cashier"
}

/**
 * Extract POS PIN from Medusa admin user object.
 */
export function extractPinFromUser(user: any): string | null {
  return user?.metadata?.pos_pin || null
}

/**
 * Check if a discount percentage requires elevated permissions.
 */
export function discountRequiresElevation(percentage: number): boolean {
  return percentage > 10
}

export const ALL_ROLES: POSRole[] = ["admin", "manager", "cashier"]
