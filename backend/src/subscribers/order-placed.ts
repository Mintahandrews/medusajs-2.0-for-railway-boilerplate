import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { EmailTemplates } from '../modules/email-notifications/templates'
import { STOREFRONT_URL, SUPPORT_EMAIL } from '../lib/constants'

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  
  const order = await orderModuleService.retrieveOrder(data.id, { relations: ['items', 'summary', 'shipping_address'] })
  const shippingAddress = (order as any).shipping_address

  try {
    // Send confirmation to customer
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: 'email',
      template: EmailTemplates.ORDER_PLACED,
      data: {
        emailOptions: {
          replyTo: SUPPORT_EMAIL,
          subject: 'Your Letscase order confirmation'
        },
        order,
        shippingAddress,
        orderUrl: STOREFRONT_URL
          ? `${STOREFRONT_URL}`.replace(/\/$/, '') +
            `/${(shippingAddress?.country_code ?? 'bf').toLowerCase()}/order/confirmed/${order.id}`
          : undefined,
        supportEmail: SUPPORT_EMAIL,
        preview: 'Thank you for your order!'
      }
    })

    // Send notification to admin/support
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
          order,
          shippingAddress,
          orderUrl: STOREFRONT_URL
            ? `${STOREFRONT_URL}`.replace(/\/$/, '') +
              `/${(shippingAddress?.country_code ?? 'bf').toLowerCase()}/order/confirmed/${order.id}`
            : undefined,
          supportEmail: SUPPORT_EMAIL,
          preview: 'A new order was placed.'
        }
      })
    }
  } catch (error) {
    console.error('Error sending order confirmation notification:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
}
