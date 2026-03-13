import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { EmailTemplates } from '../modules/email-notifications/templates'
import { STOREFRONT_URL, SUPPORT_EMAIL, POSTHOG_EVENTS_API_KEY, isGuestEmail, phoneFromGuestEmail, SMSONLINEGH_API_KEY } from '../lib/constants'
import { trackOrderPlacedWorkflow } from '../workflows/track-order-placed'

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  try {
    const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
    const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  
    const order = await orderModuleService.retrieveOrder(data.id, { relations: ['items', 'summary', 'shipping_address'] })
    const shippingAddress = (order as any).shipping_address

    const orderUrl = STOREFRONT_URL
      ? `${STOREFRONT_URL}`.replace(/\/$/, '') +
        `/${(shippingAddress?.country_code ?? 'gh').toLowerCase()}/order/confirmed/${order.id}`
      : undefined

    const notificationData = {
      order,
      shippingAddress,
      orderUrl,
      supportEmail: SUPPORT_EMAIL,
      preview: 'Thank you for your order!'
    }

    // Send email to customer (skip for phone-based guest emails)
    if (!isGuestEmail(order.email)) {
      await notificationModuleService.createNotifications({
        to: order.email,
        channel: 'email',
        template: EmailTemplates.ORDER_PLACED,
        data: {
          emailOptions: {
            replyTo: SUPPORT_EMAIL,
            subject: 'Your Letscase order confirmation'
          },
          ...notificationData,
        }
      })
    }

    // Send SMS to customer phone (if SMS is configured)
    if (SMSONLINEGH_API_KEY) {
      const phone = shippingAddress?.phone || phoneFromGuestEmail(order.email)
      if (phone) {
        try {
          await notificationModuleService.createNotifications({
            to: phone.replace(/\D/g, ''),
            channel: 'sms',
            template: EmailTemplates.ORDER_PLACED,
            data: notificationData,
          })
        } catch (smsErr) {
          console.warn('[order-placed] SMS send failed (non-fatal):', (smsErr as any)?.message)
        }
      }
    }

    // Send notification to admin/support (always email)
    if (SUPPORT_EMAIL) {
      await notificationModuleService.createNotifications({
        to: SUPPORT_EMAIL,
        channel: 'email',
        template: EmailTemplates.ORDER_PLACED,
        data: {
          emailOptions: {
            replyTo: SUPPORT_EMAIL,
            subject: 'New order received on Letscase'
          },
          ...notificationData,
          preview: 'A new order was placed.',
        }
      })
    }
  } catch (error) {
    console.error('Error sending order confirmation notification:', error)
  }

  // Track order in PostHog analytics (if configured)
  if (POSTHOG_EVENTS_API_KEY) {
    try {
      await trackOrderPlacedWorkflow(container).run({
        input: { order_id: data.id },
      })
    } catch (error) {
      console.error('Error tracking order in PostHog:', error)
    }
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
}
