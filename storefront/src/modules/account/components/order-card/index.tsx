"use client"

import { useMemo } from "react"

import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { getStatusColors } from "@modules/order/components/order-status-stepper"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

function deriveCardStatus(order: HttpTypes.StoreOrder): string {
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

const OrderCard = ({ order }: OrderCardProps) => {
  const numberOfLines = useMemo(() => {
    return (
      order.items?.reduce((acc, item) => {
        return acc + item.quantity
      }, 0) ?? 0
    )
  }, [order])

  const numberOfProducts = useMemo(() => {
    return order.items?.length ?? 0
  }, [order])

  return (
    <div className="bg-white flex flex-col" data-testid="order-card">
      <div className="flex items-center gap-3 mb-1">
        <div className="uppercase text-large-semi">
          #<span data-testid="order-display-id">{order.display_id}</span>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getStatusColors(deriveCardStatus(order))}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {deriveCardStatus(order)}
        </span>
      </div>
      <div className="flex items-center divide-x divide-gray-200 text-small-regular text-ui-fg-base">
        <span className="pr-2" data-testid="order-created-at">
          {new Date(order.created_at).toDateString()}
        </span>
        <span className="px-2" data-testid="order-amount">
          {convertToLocale({
            amount: order.total,
            currency_code: order.currency_code,
          })}
        </span>
        <span className="pl-2">{`${numberOfLines} ${
          numberOfLines > 1 ? "items" : "item"
        }`}</span>
      </div>
      <div className="grid grid-cols-2 small:grid-cols-4 gap-4 my-4">
        {order.items?.slice(0, 3).map((i) => {
          return (
            <div
              key={i.id}
              className="flex flex-col gap-y-2"
              data-testid="order-item"
            >
              <Thumbnail thumbnail={i.thumbnail} images={[]} size="full" />
              <div className="flex items-center text-small-regular text-ui-fg-base">
                <span
                  className="text-ui-fg-base font-semibold"
                  data-testid="item-title"
                >
                  {i.title}
                </span>
                <span className="ml-2">x</span>
                <span data-testid="item-quantity">{i.quantity}</span>
              </div>
            </div>
          )
        })}
        {numberOfProducts > 4 && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <span className="text-small-regular text-ui-fg-base">
              + {numberOfLines - 4}
            </span>
            <span className="text-small-regular text-ui-fg-base">more</span>
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <LocalizedClientLink
          href={`/account/orders/details/${order.id}`}
          data-testid="order-details-link"
          className="inline-flex items-center justify-center rounded-lg border border-ui-border-base bg-ui-bg-base text-ui-fg-base h-10 px-5 text-[14px] font-semibold hover:bg-ui-bg-base-hover transition-colors"
        >
          See details
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderCard
