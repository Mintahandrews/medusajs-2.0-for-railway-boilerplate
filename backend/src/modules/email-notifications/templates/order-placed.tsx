import { Text, Section, Hr, Button } from '@react-email/components'
import * as React from 'react'
import { Base } from './base'
import { OrderDTO, OrderAddressDTO } from '@medusajs/framework/types'

export const ORDER_PLACED = 'order-placed'

const NO_DIVISION_CURRENCIES = new Set([
  'krw', 'jpy', 'vnd', 'clp', 'pyg', 'xaf', 'xof', 'bif', 'djf', 'gnf', 'kmf', 'mga', 'rwf', 'xpf', 'htg', 'vuv', 'xag', 'xdr', 'xau',
])

function toNumber(value: any): number {
  if (value == null) {
    return 0
  }

  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  if (typeof value === 'bigint') {
    return Number(value)
  }

  if (typeof value === 'object') {
    if (typeof (value as any).toNumber === 'function') {
      return (value as any).toNumber()
    }

    if (typeof (value as any).toString === 'function') {
      const parsed = Number((value as any).toString())
      return Number.isFinite(parsed) ? parsed : 0
    }
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatMoney(amount: any, currencyCode?: string): string {
  const normalizedCurrency = (currencyCode ?? '').toLowerCase()
  const currency = normalizedCurrency.toUpperCase()

  // Medusa totals/prices are often stored as smallest units.
  // We convert for most currencies, but keep “no division” currencies as-is.
  const raw = toNumber(amount)
  const value = NO_DIVISION_CURRENCIES.has(normalizedCurrency) ? raw : raw / 100

  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
    }).format(value)
  } catch {
    return `${value.toFixed(NO_DIVISION_CURRENCIES.has(normalizedCurrency) ? 0 : 2)} ${currency}`.trim()
  }
}

interface OrderPlacedPreviewProps {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  shippingAddress: OrderAddressDTO
}

export interface OrderPlacedTemplateProps {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  shippingAddress: OrderAddressDTO
  orderUrl?: string
  supportEmail?: string
  preview?: string
}

export const isOrderPlacedTemplateData = (data: any): data is OrderPlacedTemplateProps =>
  typeof data.order === 'object' && typeof data.shippingAddress === 'object'

export const OrderPlacedTemplate: React.FC<OrderPlacedTemplateProps> & {
  PreviewProps: OrderPlacedPreviewProps
} = ({ order, shippingAddress, orderUrl, supportEmail, preview = 'Your order has been placed!' }) => {
  const currencyCode = order.currency_code
  return (
    <Base preview={preview}>
      <Section>
        <Text style={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 24px', color: '#008080' }}>
          Order Confirmation
        </Text>
        <Text style={{ margin: '0 0 15px', fontSize: '15px', color: '#222' }}>
          Hi {shippingAddress.first_name} {shippingAddress.last_name},
        </Text>
        <Text style={{ margin: '0 0 24px', color: '#222' }}>
          Thank you for your order! Below are your order details:
        </Text>
        <Section style={{ background: '#f6f8fa', borderRadius: 8, padding: 16, margin: '0 0 24px' }}>
          <Text style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px', color: '#008080' }}>
            Order Summary
          </Text>
          <Text style={{ margin: '0 0 4px', color: '#222' }}>
            <strong>Order ID:</strong> {order.display_id}
          </Text>
          <Text style={{ margin: '0 0 4px', color: '#222' }}>
            <strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}
          </Text>
          <Text style={{ margin: '0 0 4px', color: '#222' }}>
            <strong>Total:</strong> {formatMoney(order.summary.raw_current_order_total.value, currencyCode)}
          </Text>
        </Section>
        {orderUrl && (
          <Section style={{ textAlign: 'center', margin: '10px 0 30px' }}>
            <Button
              href={orderUrl}
              className="bg-[#008080] rounded text-white text-[15px] font-semibold no-underline px-7 py-3 shadow-sm border-0 cursor-pointer"
            >
              View your order
            </Button>
          </Section>
        )}

        <Hr style={{ margin: '20px 0' }} />

        <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px' }}>
          Shipping Address
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          {shippingAddress.address_1}
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          {shippingAddress.city}, {shippingAddress.province} {shippingAddress.postal_code}
        </Text>
        <Text style={{ margin: '0 0 20px' }}>
          {(shippingAddress.country_code ?? '').toUpperCase()}
        </Text>

        <Hr style={{ margin: '20px 0' }} />

        <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px' }}>
          Order Items
        </Text>

        <div style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #ddd',
          margin: '10px 0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: '#f2f2f2',
            padding: '8px',
            borderBottom: '1px solid #ddd'
          }}>
            <Text style={{ fontWeight: 'bold' }}>Item</Text>
            <Text style={{ fontWeight: 'bold' }}>Quantity</Text>
            <Text style={{ fontWeight: 'bold' }}>Price</Text>
          </div>
          {order.items.map((item) => (
            <div key={item.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px',
              borderBottom: '1px solid #ddd'
            }}>
              <Text>{item.title} - {item.product_title}</Text>
              <Text>{item.quantity}</Text>
              <Text>{formatMoney(item.unit_price, currencyCode)}</Text>
            </div>
          ))}
        </div>

        {supportEmail && (
          <Text style={{ margin: '30px 0 0', fontSize: '12px', color: '#666666' }}>
            Need help? Reply to this email or contact us at {supportEmail}.
          </Text>
        )}
      </Section>
    </Base>
  )
}

OrderPlacedTemplate.PreviewProps = {
  order: {
    id: 'test-order-id',
    display_id: 'ORD-123',
    created_at: new Date().toISOString(),
    email: 'test@example.com',
    currency_code: 'USD',
    items: [
      { id: 'item-1', title: 'Item 1', product_title: 'Product 1', quantity: 2, unit_price: 1000 },
      { id: 'item-2', title: 'Item 2', product_title: 'Product 2', quantity: 1, unit_price: 2500 }
    ],
    shipping_address: {
      first_name: 'Test',
      last_name: 'User',
      address_1: '123 Main St',
      city: 'Anytown',
      province: 'CA',
      postal_code: '12345',
      country_code: 'US'
    },
    summary: { raw_current_order_total: { value: 4500 } }
  },
  shippingAddress: {
    first_name: 'Test',
    last_name: 'User',
    address_1: '123 Main St',
    city: 'Anytown',
    province: 'CA',
    postal_code: '12345',
    country_code: 'US'
  }
} as OrderPlacedPreviewProps

export default OrderPlacedTemplate
