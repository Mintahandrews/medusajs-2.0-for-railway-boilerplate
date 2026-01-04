import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { EmailTemplates } from '../modules/email-notifications/templates'
import { STOREFRONT_URL, SUPPORT_EMAIL } from '../lib/constants'

async function sendOrderStatusEmail({ order, shippingAddress, template, subject, preview }) {
  const notificationModuleService = this.notificationModuleService
  await notificationModuleService.createNotifications({
    to: order.email,
    channel: 'email',
    template,
    data: {
      emailOptions: {
        replyTo: SUPPORT_EMAIL,
        subject
      },
      order,
      shippingAddress,
      orderUrl: STOREFRONT_URL
        ? `${STOREFRONT_URL}`.replace(/\/$/, '') +
          `/${(shippingAddress?.country_code ?? 'bf').toLowerCase()}/order/confirmed/${order.id}`
        : undefined,
      supportEmail: SUPPORT_EMAIL,
      preview
    }
  })
}

export async function orderShippedHandler({ event: { data }, container }: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  const order = await orderModuleService.retrieveOrder(data.id, { relations: ['items', 'summary', 'shipping_address'] })
  const shippingAddress = (order as any).shipping_address
  await sendOrderStatusEmail.call({ notificationModuleService }, {
    order,
    shippingAddress,
    template: EmailTemplates.ORDER_SHIPPED,
    subject: 'Your order has shipped! 🎉',
    preview: 'Your order is on its way!'
  })
}

export async function orderDeliveredHandler({ event: { data }, container }: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  const order = await orderModuleService.retrieveOrder(data.id, { relations: ['items', 'summary', 'shipping_address'] })
  const shippingAddress = (order as any).shipping_address
  await sendOrderStatusEmail.call({ notificationModuleService }, {
    order,
    shippingAddress,
    template: EmailTemplates.ORDER_DELIVERED,
    subject: 'Your order has been delivered!',
    preview: 'Order delivered.'
  })
}

export async function orderCancelledHandler({ event: { data }, container }: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  const order = await orderModuleService.retrieveOrder(data.id, { relations: ['items', 'summary', 'shipping_address'] })
  const shippingAddress = (order as any).shipping_address
  await sendOrderStatusEmail.call({ notificationModuleService }, {
    order,
    shippingAddress,
    template: EmailTemplates.ORDER_CANCELLED,
    subject: 'Your order has been cancelled',
    preview: 'Order cancelled.'
  })
}

export const configShipped: SubscriberConfig = { event: 'order.shipped' }
export const configDelivered: SubscriberConfig = { event: 'order.delivered' }
export const configCancelled: SubscriberConfig = { event: 'order.cancelled' }
