import { Text, Section, Button, Hr } from '@react-email/components'
import * as React from 'react'
import { Base } from './base'

export const ORDER_REFUND = 'order-refund'

const NO_DIVISION_CURRENCIES = new Set([
  'krw', 'jpy', 'vnd', 'clp', 'pyg', 'xaf', 'xof', 'bif',
  'djf', 'gnf', 'kmf', 'mga', 'rwf', 'xpf', 'htg', 'vuv',
])

function toNumber(value: any): number {
  if (value == null) return 0
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatMoney(amount: any, currencyCode?: string): string {
  const cc = (currencyCode ?? '').toLowerCase()
  const raw = toNumber(amount)
  const value = NO_DIVISION_CURRENCIES.has(cc) ? raw : raw / 100
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: cc.toUpperCase(),
      currencyDisplay: 'symbol',
    }).format(value)
  } catch {
    return `${value.toFixed(2)} ${cc.toUpperCase()}`.trim()
  }
}

export interface OrderRefundProps {
  order: { id: string; display_id: string; currency_code?: string }
  refundAmount: number
  reason?: string
  shippingAddress: { first_name?: string; last_name?: string; country_code?: string }
  orderUrl?: string
  supportEmail?: string
  preview?: string
}

export const isOrderRefundData = (data: any): data is OrderRefundProps =>
  typeof data.order === 'object' && data.refundAmount != null

const btnStyle = {
  background: '#1a1a1a',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
  padding: '12px 28px',
  display: 'inline-block' as const,
}

export const OrderRefundTemplate: React.FC<OrderRefundProps> & { PreviewProps?: OrderRefundProps } = ({
  order,
  refundAmount,
  reason,
  shippingAddress,
  orderUrl,
  supportEmail,
  preview = 'Your refund has been processed.',
}) => (
  <Base preview={preview}>
    <Section>
      <Text style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', margin: '0 0 8px', color: '#1a1a1a' }}>
        Refund Processed
      </Text>
      <Text style={{ fontSize: '14px', textAlign: 'center', margin: '0 0 28px', color: '#71717a' }}>
        Your refund is on its way back to you.
      </Text>

      <Text style={{ margin: '0 0 16px', fontSize: '15px', color: '#27272a' }}>
        Hi {shippingAddress.first_name || 'Customer'},
      </Text>
      <Text style={{ margin: '0 0 24px', fontSize: '14px', color: '#3f3f46', lineHeight: '1.6' }}>
        We have processed a refund for your order <strong>#{order.display_id}</strong>.
        The refund should appear in your account within 5&ndash;7 business days.
      </Text>

      <Section style={{ background: '#f4f4f5', borderRadius: 12, padding: '20px', margin: '0 0 24px' }}>
        <Text style={{ fontSize: '11px', fontWeight: 600, margin: '0 0 12px', color: '#a1a1aa', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Refund Details
        </Text>
        <Text style={{ margin: '0 0 6px', fontSize: '14px', color: '#27272a' }}>
          <strong>Order:</strong> #{order.display_id}
        </Text>
        <Text style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>
          <strong>Refund Amount:</strong> {formatMoney(refundAmount, order.currency_code)}
        </Text>
        {reason && (
          <Text style={{ margin: '0', fontSize: '14px', color: '#71717a' }}>
            <strong>Reason:</strong> {reason}
          </Text>
        )}
      </Section>

      {orderUrl && (
        <Section style={{ textAlign: 'center', margin: '0 0 28px' }}>
          <Button href={orderUrl} style={btnStyle}>
            View Your Order
          </Button>
        </Section>
      )}

      {supportEmail && (
        <>
          <Hr style={{ borderColor: '#e4e4e7', margin: '24px 0' }} />
          <Text style={{ margin: '0', fontSize: '13px', color: '#a1a1aa', lineHeight: '1.5' }}>
            Questions about your refund? Reply to this email or contact us at{' '}
            <span style={{ color: '#008080' }}>{supportEmail}</span>.
          </Text>
        </>
      )}
    </Section>
  </Base>
)

OrderRefundTemplate.PreviewProps = {
  order: { id: 'test-id', display_id: 'ORD-456', currency_code: 'GHS' },
  refundAmount: 5000,
  reason: 'Customer requested cancellation',
  shippingAddress: { first_name: 'Kofi', last_name: 'Mensah', country_code: 'gh' },
  orderUrl: 'https://letscasegh.com/gh/order/confirmed/test-id',
  supportEmail: 'support@letscase.com',
} as OrderRefundProps

export default OrderRefundTemplate
