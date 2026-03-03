import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { pendingRoleAssignments } from "../route"

const VALID_ROLES = ["admin", "manager", "cashier"]

/**
 * POST /admin/pos/invite/role
 * Stores a pending POS role assignment for an email without creating an invite.
 * Used by the admin invite-role widget to pre-store the role before
 * the native Medusa invite dialog creates the invite.
 *
 * Body: { email: string, pos_role: "admin"|"manager"|"cashier" }
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { email, pos_role } = req.body as {
    email?: string
    pos_role?: string
  }

  if (!email || !pos_role) {
    res.status(400).json({ message: "email and pos_role are required" })
    return
  }

  if (!VALID_ROLES.includes(pos_role)) {
    res.status(400).json({ message: `pos_role must be one of: ${VALID_ROLES.join(", ")}` })
    return
  }

  const normalizedEmail = email.toLowerCase().trim()
  pendingRoleAssignments.set(normalizedEmail, { pos_role })

  console.log(`[pos/invite/role] Stored pending role "${pos_role}" for ${normalizedEmail}`)

  res.json({ success: true, email: normalizedEmail, pos_role })
}
