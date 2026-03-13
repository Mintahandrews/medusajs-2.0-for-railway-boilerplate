import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { EmailTemplates } from '../modules/email-notifications/templates'
import { STOREFRONT_URL, SUPPORT_EMAIL, SMSONLINEGH_API_KEY, isGuestEmail, phoneFromGuestEmail } from '../lib/constants'

export default async function returnCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  try {
    const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
    const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)

    // The return event data should contain order_id
    const orderId = data.order_id || data.id
    if (!orderId) {
      console.warn('[return-created] No order ID in event data')
      return
    }

    const order = await orderModuleService.retrieveOrder(orderId, {
      relations: ['items', 'shipping_address'],
    })
    const shippingAddress = (order as any).shipping_address

    const orderUrl = STOREFRONT_URL
      ? `${STOREFRONT_URL}`.replace(/\/$/, '') +
        `/${(shippingAddress?.country_code ?? 'gh').toLowerCase()}/order/confirmed/${order.id}`
      : undefined

    const notificationData = {
      order,
      shippingAddress,
      returnId: data.return_id || data.id,
      orderUrl,
      supportEmail: SUPPORT_EMAIL,
      preview: 'Your return request has been received.',
    }

    // Send return email to customer (skip for guest emails)
    if (order.email && !isGuestEmail(order.email)) {
      try {
        await notificationModuleService.createNotifications({
          to: order.email,
          channel: 'email',
          template: EmailTemplates.RETURN_CREATED,
          data: {
            emailOptions: {
              replyTo: SUPPORT_EMAIL,
              subject: `Return request received — order #${(order as any).display_id}`,
            },
            ...notificationData,
          },
        })
      } catch (emailErr) {
        console.warn('[return-created] Email send failed:', (emailErr as any)?.message)
      }
    }

    // Send return SMS
    if (SMSONLINEGH_API_KEY) {
      const phone = shippingAddress?.phone || phoneFromGuestEmail(order.email)
      if (phone) {
        try {
          await notificationModuleService.createNotifications({
            to: phone.replace(/\D/g, ''),
            channel: 'sms',
            template: EmailTemplates.RETURN_CREATED,
            data: notificationData,
          })
        } catch (smsErr) {
          console.warn('[return-created] SMS send failed (non-fatal):', (smsErr as any)?.message)
        }
      }
    }

    // Notify admin
    if (SUPPORT_EMAIL) {
      try {
        await notificationModuleService.createNotifications({
          to: SUPPORT_EMAIL,
          channel: 'email',
          template: EmailTemplates.RETURN_CREATED,
          data: {
            emailOptions: {
              replyTo: SUPPORT_EMAIL,
              subject: `New return request — order #${(order as any).display_id}`,
            },
            ...notificationData,
            preview: 'A return request was submitted.',
          },
        })
      } catch (adminErr) {
        console.warn('[return-created] Admin email failed:', (adminErr as any)?.message)
      }
    }
  } catch (error) {
    console.error('[return-created] Failed:', error)
  }
}

export const config: SubscriberConfig = {
  event: ['return.created'],
}
