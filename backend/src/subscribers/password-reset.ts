import { INotificationModuleService } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { STOREFRONT_URL, BACKEND_URL, SUPPORT_EMAIL } from '../lib/constants'
import { EmailTemplates } from '../modules/email-notifications/templates'

type PasswordResetPayload = {
  entity_id: string  // email
  token: string
  actor_type: string // "customer" | "user"
}

export default async function passwordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<PasswordResetPayload>) {
  const { entity_id: email, token, actor_type } = data

  try {
    const notificationModuleService: INotificationModuleService =
      container.resolve(Modules.NOTIFICATION)

    // Build the reset URL based on actor type
    let resetUrl: string
    if (actor_type === 'customer') {
      const storefront = STOREFRONT_URL || 'https://letscasegh.com'
      resetUrl = `${storefront}/gh/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
    } else {
      // Admin users — point to the Medusa admin dashboard
      const backend = BACKEND_URL || 'http://localhost:9000'
      resetUrl = `${backend}/app/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
    }

    console.log(`[password-reset] Sending reset email to ${email} (${actor_type})...`)

    await notificationModuleService.createNotifications({
      to: email,
      channel: 'email',
      template: EmailTemplates.PASSWORD_RESET,
      data: {
        emailOptions: {
          replyTo: SUPPORT_EMAIL,
          subject: 'Reset your Lets Case password',
        },
        resetLink: resetUrl,
        preview: 'Reset your Lets Case password',
      },
    })

    console.log(`[password-reset] Successfully sent reset email to ${email}`)
  } catch (error) {
    console.error(`[password-reset] Failed to send reset email to ${email}:`, error)
  }
}

export const config: SubscriberConfig = {
  event: 'auth.password_reset',
}
