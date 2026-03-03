import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { IUserModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

/**
 * Pending role assignments — stored in memory and flushed when the user accepts.
 * In production you could persist this to a DB table, but for simplicity we
 * use a module-level Map keyed by email.
 */
export const pendingRoleAssignments = new Map<
  string,
  { pos_role: string; pos_pin?: string }
>()

const VALID_ROLES = ["admin", "manager", "cashier"]

/**
 * POST /admin/pos/invite
 * Creates a Medusa admin invite and stores the intended POS role so
 * it can be auto-assigned when the user accepts.
 *
 * Body: { email: string, pos_role: "admin"|"manager"|"cashier", pos_pin?: string }
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { email, pos_role, pos_pin } = req.body as {
    email?: string
    pos_role?: string
    pos_pin?: string
  }

  // Validate
  if (!email || !pos_role) {
    res.status(400).json({ message: "email and pos_role are required" })
    return
  }

  if (!VALID_ROLES.includes(pos_role)) {
    res.status(400).json({ message: `pos_role must be one of: ${VALID_ROLES.join(", ")}` })
    return
  }

  if (pos_pin && (!/^\d{4,6}$/.test(pos_pin))) {
    res.status(400).json({ message: "pos_pin must be 4-6 digits" })
    return
  }

  try {
    const userModuleService: IUserModuleService = req.scope.resolve(Modules.USER)

    // Store the pending role assignment BEFORE creating the invite
    // so the subscriber can pick it up
    pendingRoleAssignments.set(email.toLowerCase().trim(), {
      pos_role,
      ...(pos_pin ? { pos_pin } : {}),
    })

    // Create the Medusa invite — this triggers the invite.created event
    // which sends the email via the existing invite-created subscriber
    const invite = await userModuleService.createInvites({
      email: email.toLowerCase().trim(),
    })

    console.log(`[pos/invite] Created invite for ${email} with role ${pos_role}`)

    res.status(200).json({
      invite,
      pos_role,
      message: `Invite sent to ${email} with role ${pos_role}`,
    })
  } catch (error: any) {
    console.error("[pos/invite] Failed:", error)

    // Clean up pending assignment on failure
    pendingRoleAssignments.delete(email.toLowerCase().trim())

    // Handle duplicate invite
    if (error.message?.includes("already") || error.code === "23505") {
      res.status(409).json({ message: `An invite for ${email} already exists` })
      return
    }

    res.status(500).json({ message: error.message || "Failed to create invite" })
  }
}

/**
 * GET /admin/pos/invite
 * Returns all pending role assignments (for the admin UI to display)
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const userModuleService: IUserModuleService = req.scope.resolve(Modules.USER)

  try {
    const invites = await userModuleService.listInvites()
    
    // Merge with pending role assignments
    const enriched = invites.map((inv: any) => ({
      id: inv.id,
      email: inv.email,
      token: inv.token,
      accepted: inv.accepted,
      created_at: inv.created_at,
      expires_at: inv.expires_at,
      pending_role: pendingRoleAssignments.get(inv.email.toLowerCase())?.pos_role || null,
      pending_pin: pendingRoleAssignments.get(inv.email.toLowerCase())?.pos_pin ? true : false,
    }))

    res.json({ invites: enriched })
  } catch (error: any) {
    console.error("[pos/invite] GET failed:", error)
    res.status(500).json({ message: error.message || "Failed to list invites" })
  }
}
