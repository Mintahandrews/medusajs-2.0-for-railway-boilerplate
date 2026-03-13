import { Modules } from '@medusajs/framework/utils'
import { ICustomerModuleService, INotificationModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { EmailTemplates } from '../modules/email-notifications/templates'
import { STOREFRONT_URL, SUPPORT_EMAIL, SMSONLINEGH_API_KEY, isGuestEmail } from '../lib/constants'

export default async function customerWelcomeHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  try {
    const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
    const customerModuleService: ICustomerModuleService = container.resolve(Modules.CUSTOMER)

    const customer = await customerModuleService.retrieveCustomer(data.id)
    if (!customer) return

    const firstName = customer.first_name || 'there'
    const email = customer.email
    const phone = customer.phone

    const notificationData = {
      firstName,
      storefrontUrl: STOREFRONT_URL || 'https://letscasegh.com',
      supportEmail: SUPPORT_EMAIL,
      preview: 'Welcome to Lets Case!',
    }

    // Send welcome email (skip for phone-based guest emails)
    if (email && !isGuestEmail(email)) {
      try {
        await notificationModuleService.createNotifications({
          to: email,
          channel: 'email',
          template: EmailTemplates.CUSTOMER_WELCOME,
          data: {
            emailOptions: {
              replyTo: SUPPORT_EMAIL,
              subject: 'Welcome to Lets Case!',
            },
            ...notificationData,
          },
        })
      } catch (emailErr) {
        console.warn('[customer-welcome] Email send failed:', (emailErr as any)?.message)
      }
    }

    // Send welcome SMS (if SMS configured and phone available)
    if (SMSONLINEGH_API_KEY && phone) {
      try {
        await notificationModuleService.createNotifications({
          to: phone.replace(/\D/g, ''),
          channel: 'sms',
          template: EmailTemplates.CUSTOMER_WELCOME,
          data: notificationData,
        })
      } catch (smsErr) {
        console.warn('[customer-welcome] SMS send failed (non-fatal):', (smsErr as any)?.message)
      }
    }
  } catch (error) {
    console.error('[customer-welcome] Failed:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'customer.created',
}
