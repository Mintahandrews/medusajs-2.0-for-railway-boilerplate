import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService, IPaymentModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { EmailTemplates } from '../modules/email-notifications/templates'
import { STOREFRONT_URL, SUPPORT_EMAIL, SMSONLINEGH_API_KEY, isGuestEmail, phoneFromGuestEmail } from '../lib/constants'

export default async function orderRefundHandler({
  event: { data, name: eventName },
  container,
}: SubscriberArgs<any>) {
  try {
    const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
    const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)

    // data may contain order_id or id depending on the event
    const orderId = data.order_id || data.id
    if (!orderId) {
      console.warn('[order-refund] No order ID in event data')
      return
    }

    const order = await orderModuleService.retrieveOrder(orderId, {
      relations: ['items', 'shipping_address'],
    })
    const shippingAddress = (order as any).shipping_address

    // Try to get refund amount from event data
    const refundAmount = data.amount || data.refund_amount || null
    const reason = data.reason || data.note || undefined

    const orderUrl = STOREFRONT_URL
      ? `${STOREFRONT_URL}`.replace(/\/$/, '') +
        `/${(shippingAddress?.country_code ?? 'gh').toLowerCase()}/order/confirmed/${order.id}`
      : undefined

    const notificationData = {
      order,
      refundAmount,
      reason,
      shippingAddress,
      orderUrl,
      supportEmail: SUPPORT_EMAIL,
      preview: 'Your refund has been processed.',
    }

    // Send refund email to customer (skip for guest emails)
    if (order.email && !isGuestEmail(order.email)) {
      try {
        await notificationModuleService.createNotifications({
          to: order.email,
          channel: 'email',
          template: EmailTemplates.ORDER_REFUND,
          data: {
            emailOptions: {
              replyTo: SUPPORT_EMAIL,
              subject: `Refund processed for order #${(order as any).display_id}`,
            },
            ...notificationData,
          },
        })
      } catch (emailErr) {
        console.warn('[order-refund] Email send failed:', (emailErr as any)?.message)
      }
    }

    // Send refund SMS
    if (SMSONLINEGH_API_KEY) {
      const phone = shippingAddress?.phone || phoneFromGuestEmail(order.email)
      if (phone) {
        try {
          await notificationModuleService.createNotifications({
            to: phone.replace(/\D/g, ''),
            channel: 'sms',
            template: EmailTemplates.ORDER_REFUND,
            data: notificationData,
          })
        } catch (smsErr) {
          console.warn('[order-refund] SMS send failed (non-fatal):', (smsErr as any)?.message)
        }
      }
    }

    // Notify admin
    if (SUPPORT_EMAIL) {
      try {
        await notificationModuleService.createNotifications({
          to: SUPPORT_EMAIL,
          channel: 'email',
          template: EmailTemplates.ORDER_REFUND,
          data: {
            emailOptions: {
              replyTo: SUPPORT_EMAIL,
              subject: `Refund processed — order #${(order as any).display_id}`,
            },
            ...notificationData,
            preview: 'A refund was processed.',
          },
        })
      } catch (adminErr) {
        console.warn('[order-refund] Admin email failed:', (adminErr as any)?.message)
      }
    }
  } catch (error) {
    console.error('[order-refund] Failed:', error)
  }
}

export const config: SubscriberConfig = {
  event: ['refund.created', 'order.refund_created'],
}
