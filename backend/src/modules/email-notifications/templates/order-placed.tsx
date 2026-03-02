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
        <Text style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', margin: '0 0 8px', color: '#1a1a1a' }}>
          Order Confirmed
        </Text>
        <Text style={{ fontSize: '14px', textAlign: 'center', margin: '0 0 28px', color: '#71717a' }}>
          Thank you for shopping with Lets Case!
        </Text>

        <Text style={{ margin: '0 0 16px', fontSize: '15px', color: '#27272a' }}>
          Hi {shippingAddress.first_name},
        </Text>
        <Text style={{ margin: '0 0 24px', fontSize: '14px', color: '#3f3f46', lineHeight: '1.6' }}>
          We have received your order and it is being processed. Here are your order details:
        </Text>

        {/* Order summary card */}
        <Section style={{ background: '#f4f4f5', borderRadius: 12, padding: '20px', margin: '0 0 24px' }}>
          <Text style={{ fontSize: '11px', fontWeight: 600, margin: '0 0 12px', color: '#a1a1aa', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Order Summary
          </Text>
          <Text style={{ margin: '0 0 6px', fontSize: '14px', color: '#27272a' }}>
            <strong>Order:</strong> #{order.display_id}
          </Text>
          <Text style={{ margin: '0 0 6px', fontSize: '14px', color: '#27272a' }}>
            <strong>Date:</strong> {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
          <Text style={{ margin: '0', fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>
            <strong>Total:</strong> {formatMoney(order.summary.raw_current_order_total.value, currencyCode)}
          </Text>
        </Section>

        {orderUrl && (
          <Section style={{ textAlign: 'center', margin: '0 0 28px' }}>
            <Button
              href={orderUrl}
              style={{ background: '#1a1a1a', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: 600, textDecoration: 'none', padding: '12px 28px', display: 'inline-block' }}
            >
              View Your Order
            </Button>
          </Section>
        )}

        <Hr style={{ borderColor: '#e4e4e7', margin: '24px 0' }} />

        {/* Shipping address */}
        <Text style={{ fontSize: '11px', fontWeight: 600, margin: '0 0 8px', color: '#a1a1aa', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Shipping Address
        </Text>
        <Text style={{ margin: '0 0 4px', fontSize: '14px', color: '#3f3f46' }}>
          {shippingAddress.first_name} {shippingAddress.last_name}
        </Text>
        <Text style={{ margin: '0 0 4px', fontSize: '14px', color: '#3f3f46' }}>
          {shippingAddress.address_1}
        </Text>
        <Text style={{ margin: '0 0 4px', fontSize: '14px', color: '#3f3f46' }}>
          {shippingAddress.city}{shippingAddress.province ? `, ${shippingAddress.province}` : ''} {shippingAddress.postal_code}
        </Text>
        <Text style={{ margin: '0 0 24px', fontSize: '14px', color: '#3f3f46' }}>
          {(shippingAddress.country_code ?? '').toUpperCase()}
        </Text>

        <Hr style={{ borderColor: '#e4e4e7', margin: '0 0 24px' }} />

        {/* Order items */}
        <Text style={{ fontSize: '11px', fontWeight: 600, margin: '0 0 12px', color: '#a1a1aa', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Items Ordered
        </Text>

        {order.items.map((item) => (
          <Section key={item.id} style={{ borderBottom: '1px solid #f4f4f5', padding: '10px 0' }}>
            <Text style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 600, color: '#27272a' }}>
              {item.product_title}
            </Text>
            <Text style={{ margin: '0', fontSize: '13px', color: '#71717a' }}>
              {item.title} &middot; Qty: {item.quantity} &middot; {formatMoney(item.unit_price, currencyCode)}
            </Text>
          </Section>
        ))}

        {supportEmail && (
          <Text style={{ margin: '28px 0 0', fontSize: '13px', color: '#a1a1aa', lineHeight: '1.5' }}>
            Questions about your order? Reply to this email or contact us at{' '}
            <span style={{ color: '#008080' }}>{supportEmail}</span>.
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
