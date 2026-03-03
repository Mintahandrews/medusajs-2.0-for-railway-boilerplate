import { IUserModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { pendingRoleAssignments } from "../api/admin/pos/invite/route"

/**
 * When a new admin user is created (e.g. after accepting an invite),
 * check if there's a pending POS role assignment and apply it to the
 * user's metadata automatically.
 */
export default async function userCreatedRoleHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  try {
    const userModuleService: IUserModuleService = container.resolve(Modules.USER)
    const user = await userModuleService.retrieveUser(data.id)

    if (!user?.email) {
      console.log(`[user-created-role] No email for user ${data.id}, skipping`)
      return
    }

    const email = user.email.toLowerCase().trim()
    const pending = pendingRoleAssignments.get(email)

    if (!pending) {
      console.log(`[user-created-role] No pending role for ${email}, defaulting to cashier`)
      // Set default role for any new admin user without a pending assignment
      await userModuleService.updateUsers(data.id, {
        metadata: {
          ...(user.metadata || {}),
          pos_role: "cashier",
        },
      })
      return
    }

    // Apply the pending role and optional PIN
    const newMetadata: Record<string, unknown> = {
      ...(user.metadata || {}),
      pos_role: pending.pos_role,
    }
    if (pending.pos_pin) {
      newMetadata.pos_pin = pending.pos_pin
    }

    await userModuleService.updateUsers(data.id, {
      metadata: newMetadata,
    })

    // Remove from pending map
    pendingRoleAssignments.delete(email)

    console.log(
      `[user-created-role] Auto-assigned role "${pending.pos_role}" to ${email} (user ${data.id})`
    )
  } catch (error) {
    console.error(`[user-created-role] Failed for user ${data.id}:`, error)
  }
}

export const config: SubscriberConfig = {
  event: "user.created",
}
