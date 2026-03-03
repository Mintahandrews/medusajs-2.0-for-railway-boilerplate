import { INotificationModuleService, IUserModuleService } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { BACKEND_URL, SUPPORT_EMAIL } from '../lib/constants'
import { EmailTemplates } from '../modules/email-notifications/templates'
import { pendingRoleAssignments } from '../api/admin/pos/invite/route'

export default async function userInviteHandler({
    event: { data },
    container,
  }: SubscriberArgs<any>) {

  try {
    const notificationModuleService: INotificationModuleService = container.resolve(
      Modules.NOTIFICATION,
    )
    const userModuleService: IUserModuleService = container.resolve(Modules.USER)
    const invite = await userModuleService.retrieveInvite(data.id)

    // Check if there's a pending role assignment for this invite
    const pending = pendingRoleAssignments.get(invite.email.toLowerCase().trim())
    const posRole = pending?.pos_role || null
    const roleLabel = posRole
      ? { admin: 'Admin', manager: 'Manager', cashier: 'Cashier' }[posRole] || posRole
      : null

    console.log(`[invite-created] Sending invite email to ${invite.email}${posRole ? ` (role: ${posRole})` : ''}...`)

    await notificationModuleService.createNotifications({
      to: invite.email,
      channel: 'email',
      template: EmailTemplates.INVITE_USER,
      data: {
        emailOptions: {
          replyTo: SUPPORT_EMAIL,
          subject: roleLabel
            ? `You're invited to Letscase Admin as ${roleLabel}`
            : "You're invited to Letscase Admin"
        },
        inviteLink: `${BACKEND_URL}/app/invite?token=${invite.token}`,
        preview: roleLabel
          ? `Accept your invitation and join as ${roleLabel}...`
          : 'Accept your admin invitation...',
        posRole: posRole || undefined,
      }
    })

    console.log(`[invite-created] Successfully sent invite email to ${invite.email}`)
  } catch (error) {
    console.error(`[invite-created] Failed to send invite email for invite ${data.id}:`, error)
  }
}

export const config: SubscriberConfig = {
  event: ['invite.created', 'invite.resent']
}
