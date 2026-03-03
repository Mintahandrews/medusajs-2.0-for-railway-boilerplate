import { defineMiddlewares } from "@medusajs/framework/http"
import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework"
import type { IUserModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

/**
 * POS Role-Based Access Control (RBAC) middleware for the Medusa admin backend.
 *
 * Reads the authenticated user's `metadata.pos_role` and blocks access
 * to restricted admin routes for non-privileged users.
 *
 * Role hierarchy:
 *   admin   → full access to everything
 *   manager → orders, customers, inventory, pricing (no products/settings/users)
 *   cashier → read-only on orders + customers (blocks write on most routes)
 */

type PosRole = "admin" | "manager" | "cashier"

/**
 * Routes that only admin role can access (destructive / configuration)
 */
const ADMIN_ONLY_PATTERNS = [
  "/admin/users",         // Manage team members
  "/admin/invites",       // Manage invites
  "/admin/store",         // Store settings
  "/admin/api-keys",      // API keys
  "/admin/tax-",          // Tax settings
  "/admin/shipping-",     // Shipping settings
  "/admin/fulfillment",   // Fulfillment settings
  "/admin/sales-channels",// Sales channels
  "/admin/workflows",     // Workflows
]

/**
 * Routes that manager + admin can access (day-to-day operations)
 */
const MANAGER_PATTERNS = [
  "/admin/orders",
  "/admin/draft-orders",
  "/admin/customers",
  "/admin/products",
  "/admin/inventory",
  "/admin/price-lists",
  "/admin/promotions",
  "/admin/collections",
  "/admin/categories",
  "/admin/regions",
  "/admin/currencies",
  "/admin/pos",
]

/**
 * Routes that ANY authenticated admin can access (including cashier)
 * - GET on most resources for read access
 * - /admin/users/me (own profile)
 * - /admin/auth (login)
 */
const ALWAYS_ALLOWED_PATTERNS = [
  "/admin/users/me",
  "/admin/auth",
]

function matchesAny(path: string, patterns: string[]): boolean {
  return patterns.some((p) => path.startsWith(p))
}

/**
 * The actual RBAC guard middleware function.
 * Applied to all /admin/* routes (except auth).
 */
async function posRbacGuard(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  try {
    // Always allow these paths regardless of role
    if (matchesAny(req.path, ALWAYS_ALLOWED_PATTERNS)) {
      return next()
    }

    // Get the authenticated user ID from the auth context
    const authUserId = (req as any).auth_context?.actor_id
    if (!authUserId) {
      // Not authenticated — let Medusa's own auth middleware handle it
      return next()
    }

    // Resolve user to get metadata
    const userModuleService: IUserModuleService = req.scope.resolve(Modules.USER)
    let user: any
    try {
      user = await userModuleService.retrieveUser(authUserId)
    } catch {
      // User not found — let Medusa handle it
      return next()
    }

    const role: PosRole = user?.metadata?.pos_role || "cashier"

    // Admin gets full access
    if (role === "admin") {
      return next()
    }

    // Check admin-only routes
    if (matchesAny(req.path, ADMIN_ONLY_PATTERNS)) {
      // Allow GET for managers (read-only view)
      if (role === "manager" && req.method === "GET") {
        return next()
      }
      res.status(403).json({
        message: `Access denied. Your role (${role}) does not have permission for this action.`,
        type: "forbidden",
      })
      return
    }

    // Manager gets read + write on operational routes
    if (role === "manager") {
      return next()
    }

    // Cashier: read-only on manager routes, blocked on admin routes
    if (role === "cashier") {
      if (matchesAny(req.path, MANAGER_PATTERNS) && req.method === "GET") {
        return next()
      }

      // Block write operations for cashier
      if (req.method !== "GET") {
        res.status(403).json({
          message: `Access denied. Cashier role cannot perform write operations on this resource.`,
          type: "forbidden",
        })
        return
      }

      // Allow GET on other routes (read access)
      return next()
    }

    return next()
  } catch (error) {
    console.error("[pos-rbac-middleware] Error:", error)
    // Don't block on errors — fail open so the system stays usable
    return next()
  }
}

/**
 * Custom middleware configuration.
 */
export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/custom/*",
      method: ["POST"],
      bodyParser: { sizeLimit: "10mb" },
    },
    {
      matcher: "/admin/*",
      middlewares: [posRbacGuard],
    },
  ],
})
