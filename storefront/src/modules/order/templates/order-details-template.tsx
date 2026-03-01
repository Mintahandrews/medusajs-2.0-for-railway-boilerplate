"use client"

import { X } from "lucide-react"
import React from "react"

import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import ShippingDetails from "@modules/order/components/shipping-details"
import OrderStatusStepper from "@modules/order/components/order-status-stepper"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

function deriveOrderStatus(order: HttpTypes.StoreOrder): string {
  const status = (order as any).status
  if (status) {
    const formatted = status.split("_").join(" ")
    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }
  const fulfillments = (order as any).fulfillments
  if (fulfillments?.length) {
    const allDelivered = fulfillments.every((f: any) => f.delivered_at)
    const allShipped = fulfillments.every((f: any) => f.shipped_at)
    if (allDelivered) return "Delivered"
    if (allShipped) return "Shipped"
    return "Processing"
  }
  return "Pending"
}

function derivePaymentStatus(order: HttpTypes.StoreOrder): string {
  const collections = (order as any).payment_collections
  if (collections?.length) {
    const collection = collections[0]
    if (collection.status) {
      const s = collection.status.split("_").join(" ")
      return s.slice(0, 1).toUpperCase() + s.slice(1)
    }
    const payments = collection.payments
    if (payments?.length) {
      const captured = payments.some((p: any) => p.captured_at)
      if (captured) return "Paid"
      return "Awaiting payment"
    }
  }
  return "Pending"
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
}) => {
  const orderStatus = deriveOrderStatus(order)
  const paymentStatus = derivePaymentStatus(order)

  return (
    <div className="flex flex-col justify-center gap-y-4">
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-2xl-semi">Order details</h1>
        <LocalizedClientLink
          href="/account/orders"
          className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base"
          data-testid="back-to-overview-button"
        >
          <X /> Back to overview
        </LocalizedClientLink>
      </div>
      <div
        className="flex flex-col gap-8 h-full bg-white w-full"
        data-testid="order-details-container"
      >
        <OrderDetails order={order} showStatus />
        <OrderStatusStepper
          orderStatus={orderStatus}
          paymentStatus={paymentStatus}
        />
        <Items items={order.items} />
        <ShippingDetails order={order} />
        <OrderSummary order={order} />
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
