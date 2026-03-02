import { Section, Text, Button, Hr } from '@react-email/components'
import * as React from 'react'
import { Base } from './base'
import { OrderDTO, OrderAddressDTO } from '@medusajs/framework/types'

export const ORDER_SHIPPED = 'order-shipped'
export const ORDER_DELIVERED = 'order-delivered'
export const ORDER_CANCELLED = 'order-cancelled'

export interface OrderStatusTemplateProps {
  order: OrderDTO & { display_id: string }
  shippingAddress: OrderAddressDTO
  orderUrl?: string
  supportEmail?: string
  preview?: string
}

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

export const OrderShippedTemplate: React.FC<OrderStatusTemplateProps> & { PreviewProps?: OrderStatusTemplateProps } = ({ order, shippingAddress, orderUrl, supportEmail, preview = 'Your order has shipped!' }) => (
  <Base preview={preview}>
    <Section>
      <Text style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', margin: '0 0 8px', color: '#1a1a1a' }}>
        Your Order Has Shipped
      </Text>
      <Text style={{ fontSize: '14px', textAlign: 'center', margin: '0 0 28px', color: '#71717a' }}>
        It&apos;s on its way to you!
      </Text>
      <Text style={{ margin: '0 0 16px', fontSize: '15px', color: '#27272a' }}>
        Hi {shippingAddress.first_name},
      </Text>
      <Text style={{ margin: '0 0 24px', fontSize: '14px', color: '#3f3f46', lineHeight: '1.6' }}>
        Great news! Your order <strong>#{order.display_id}</strong> has been shipped and is on its way. You will receive a delivery update soon.
      </Text>
      {orderUrl && (
        <Section style={{ textAlign: 'center', margin: '0 0 28px' }}>
          <Button href={orderUrl} style={btnStyle}>
            Track Your Order
          </Button>
        </Section>
      )}
      {supportEmail && (
        <>
          <Hr style={{ borderColor: '#e4e4e7', margin: '24px 0' }} />
          <Text style={{ margin: '0', fontSize: '13px', color: '#a1a1aa', lineHeight: '1.5' }}>
            Questions? Reply to this email or contact us at{' '}
            <span style={{ color: '#008080' }}>{supportEmail}</span>.
          </Text>
        </>
      )}
    </Section>
  </Base>
)

export const OrderDeliveredTemplate: React.FC<OrderStatusTemplateProps> & { PreviewProps?: OrderStatusTemplateProps } = ({ order, shippingAddress, orderUrl, supportEmail, preview = 'Your order has been delivered!' }) => (
  <Base preview={preview}>
    <Section>
      <Text style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', margin: '0 0 8px', color: '#1a1a1a' }}>
        Order Delivered
      </Text>
      <Text style={{ fontSize: '14px', textAlign: 'center', margin: '0 0 28px', color: '#71717a' }}>
        Your package has arrived!
      </Text>
      <Text style={{ margin: '0 0 16px', fontSize: '15px', color: '#27272a' }}>
        Hi {shippingAddress.first_name},
      </Text>
      <Text style={{ margin: '0 0 24px', fontSize: '14px', color: '#3f3f46', lineHeight: '1.6' }}>
        Your order <strong>#{order.display_id}</strong> has been delivered. We hope you love your new case! If something isn&apos;t right, we&apos;re here to help.
      </Text>
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
            Questions? Reply to this email or contact us at{' '}
            <span style={{ color: '#008080' }}>{supportEmail}</span>.
          </Text>
        </>
      )}
    </Section>
  </Base>
)

export const OrderCancelledTemplate: React.FC<OrderStatusTemplateProps> & { PreviewProps?: OrderStatusTemplateProps } = ({ order, shippingAddress, orderUrl, supportEmail, preview = 'Your order has been cancelled.' }) => (
  <Base preview={preview}>
    <Section>
      <Text style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', margin: '0 0 8px', color: '#1a1a1a' }}>
        Order Cancelled
      </Text>
      <Text style={{ fontSize: '14px', textAlign: 'center', margin: '0 0 28px', color: '#71717a' }}>
        We&apos;re sorry to see this order go.
      </Text>
      <Text style={{ margin: '0 0 16px', fontSize: '15px', color: '#27272a' }}>
        Hi {shippingAddress.first_name},
      </Text>
      <Text style={{ margin: '0 0 24px', fontSize: '14px', color: '#3f3f46', lineHeight: '1.6' }}>
        Your order <strong>#{order.display_id}</strong> has been cancelled. If a payment was made, any applicable refund will be processed within 5-7 business days.
      </Text>
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
            Questions? Reply to this email or contact us at{' '}
            <span style={{ color: '#008080' }}>{supportEmail}</span>.
          </Text>
        </>
      )}
    </Section>
  </Base>
)
