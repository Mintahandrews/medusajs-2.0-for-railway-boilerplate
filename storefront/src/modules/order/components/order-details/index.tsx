import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const formatStatus = (str: string) => {
    const formatted = str.split("_").join(" ")
    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  const getOrderStatus = () => {
    const status = (order as any).status
    if (status) return formatStatus(status)
    // Derive from fulfillments if available
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

  const getPaymentStatus = () => {
    const collections = (order as any).payment_collections
    if (collections?.length) {
      const collection = collections[0]
      if (collection.status) return formatStatus(collection.status)
      const payments = collection.payments
      if (payments?.length) {
        const captured = payments.some((p: any) => p.captured_at)
        if (captured) return "Paid"
        return "Awaiting payment"
      }
    }
    return "Pending"
  }

  return (
    <div>
      <Text>
        We have sent the order confirmation details to{" "}
        <span
          className="text-ui-fg-medium-plus font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </Text>
      <Text className="mt-2">
        Order date:{" "}
        <span data-testid="order-date">
          {new Date(order.created_at).toDateString()}
        </span>
      </Text>
      <Text className="mt-2 text-ui-fg-interactive">
        Order number: <span data-testid="order-id">{order.display_id}</span>
      </Text>

      {showStatus && (
        <div className="flex flex-col small:flex-row small:items-center text-compact-small gap-y-2 small:gap-x-6 mt-6">
          <Text>
            Order status:{" "}
            <span className="text-ui-fg-subtle font-medium" data-testid="order-status">
              {getOrderStatus()}
            </span>
          </Text>
          <Text>
            Payment status:{" "}
            <span
              className="text-ui-fg-subtle font-medium"
              data-testid="order-payment-status"
            >
              {getPaymentStatus()}
            </span>
          </Text>
        </div>
      )}
    </div>
  )
}

export default OrderDetails
