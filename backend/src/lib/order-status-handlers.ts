import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { EmailTemplates } from '../modules/email-notifications/templates'
import { STOREFRONT_URL, SUPPORT_EMAIL, isGuestEmail, phoneFromGuestEmail, SMSONLINEGH_API_KEY } from '../lib/constants'

async function sendOrderStatusNotifications({
  notificationModuleService,
  order,
  shippingAddress,
  template,
  subject,
  preview,
}: {
  notificationModuleService: INotificationModuleService
  order: any
  shippingAddress: any
  template: string
  subject: string
  preview: string
}) {
  const orderUrl = STOREFRONT_URL
    ? `${STOREFRONT_URL}`.replace(/\/$/, '') +
      `/${(shippingAddress?.country_code ?? 'gh').toLowerCase()}/order/confirmed/${order.id}`
    : undefined

  const notificationData = {
    order,
    shippingAddress,
    orderUrl,
    supportEmail: SUPPORT_EMAIL,
    preview,
  }

  // Send email to customer (skip for phone-based guest emails)
  if (!isGuestEmail(order.email)) {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: 'email',
      template,
      data: {
        emailOptions: {
          replyTo: SUPPORT_EMAIL,
          subject,
        },
        ...notificationData,
      },
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
          template,
          data: notificationData,
        })
      } catch (smsErr) {
        console.warn(`[${template}] SMS send failed (non-fatal):`, (smsErr as any)?.message)
      }
    }
  }
}

export async function orderShippedHandler({ event: { data }, container }: SubscriberArgs<any>) {
  try {
    const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
    const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
    const order = await orderModuleService.retrieveOrder(data.id, { relations: ['items', 'summary', 'shipping_address'] })
    const shippingAddress = (order as any).shipping_address
    await sendOrderStatusNotifications({
      notificationModuleService,
      order,
      shippingAddress,
      template: EmailTemplates.ORDER_SHIPPED,
      subject: 'Your Letscase order has shipped!',
      preview: 'Your order is on its way!',
    })
  } catch (error) {
    console.error(`[order-shipped] Failed to send notifications for order ${data.id}:`, error)
  }
}

export async function orderDeliveredHandler({ event: { data }, container }: SubscriberArgs<any>) {
  try {
    const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
    const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
    const order = await orderModuleService.retrieveOrder(data.id, { relations: ['items', 'summary', 'shipping_address'] })
    const shippingAddress = (order as any).shipping_address
    await sendOrderStatusNotifications({
      notificationModuleService,
      order,
      shippingAddress,
      template: EmailTemplates.ORDER_DELIVERED,
      subject: 'Your order has been delivered!',
      preview: 'Order delivered.',
    })
  } catch (error) {
    console.error(`[order-delivered] Failed to send notifications for order ${data.id}:`, error)
  }
}

export async function orderCancelledHandler({ event: { data }, container }: SubscriberArgs<any>) {
  try {
    const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
    const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
    const order = await orderModuleService.retrieveOrder(data.id, { relations: ['items', 'summary', 'shipping_address'] })
    const shippingAddress = (order as any).shipping_address
    await sendOrderStatusNotifications({
      notificationModuleService,
      order,
      shippingAddress,
      template: EmailTemplates.ORDER_CANCELLED,
      subject: 'Your order has been cancelled',
      preview: 'Order cancelled.',
    })
  } catch (error) {
    console.error(`[order-cancelled] Failed to send notifications for order ${data.id}:`, error)
  }
}

export const configShipped: SubscriberConfig = { event: 'order.shipped' }
export const configDelivered: SubscriberConfig = { event: 'order.delivered' }
export const configCancelled: SubscriberConfig = { event: 'order.cancelled' }
