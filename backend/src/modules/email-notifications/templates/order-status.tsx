import { Section, Text, Button } from '@react-email/components'
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

export const OrderShippedTemplate: React.FC<OrderStatusTemplateProps> & { PreviewProps?: OrderStatusTemplateProps } = ({ order, shippingAddress, orderUrl, supportEmail, preview = 'Your order has shipped!' }) => (
  <Base preview={preview}>
    <Section>
      <Text style={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 24px', color: '#008080' }}>
        Your Order Has Shipped!
      </Text>
      <Text style={{ margin: '0 0 15px', fontSize: '15px', color: '#222' }}>
        Hi {shippingAddress.first_name} {shippingAddress.last_name},
      </Text>
      <Text style={{ margin: '0 0 24px', color: '#222' }}>
        Good news! Your order <strong>#{order.display_id}</strong> is on its way.
      </Text>
      {orderUrl && (
        <Section style={{ textAlign: 'center', margin: '10px 0 30px' }}>
          <Button
            href={orderUrl}
            className="bg-[#008080] rounded text-white text-[15px] font-semibold no-underline px-7 py-3 shadow-sm border-0 cursor-pointer"
          >
            Track your order
          </Button>
        </Section>
      )}
      <Text style={{ margin: '24px 0 0', color: '#888', fontSize: '13px' }}>
        If you have any questions, reply to this email or contact us at {supportEmail}.
      </Text>
    </Section>
  </Base>
)

export const OrderDeliveredTemplate: React.FC<OrderStatusTemplateProps> & { PreviewProps?: OrderStatusTemplateProps } = ({ order, shippingAddress, orderUrl, supportEmail, preview = 'Your order has been delivered!' }) => (
  <Base preview={preview}>
    <Section>
      <Text style={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 24px', color: '#008080' }}>
        Order Delivered
      </Text>
      <Text style={{ margin: '0 0 15px', fontSize: '15px', color: '#222' }}>
        Hi {shippingAddress.first_name} {shippingAddress.last_name},
      </Text>
      <Text style={{ margin: '0 0 24px', color: '#222' }}>
        Your order <strong>#{order.display_id}</strong> has been delivered. We hope you enjoy your purchase!
      </Text>
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
      <Text style={{ margin: '24px 0 0', color: '#888', fontSize: '13px' }}>
        If you have any questions, reply to this email or contact us at {supportEmail}.
      </Text>
    </Section>
  </Base>
)

export const OrderCancelledTemplate: React.FC<OrderStatusTemplateProps> & { PreviewProps?: OrderStatusTemplateProps } = ({ order, shippingAddress, orderUrl, supportEmail, preview = 'Your order has been cancelled.' }) => (
  <Base preview={preview}>
    <Section>
      <Text style={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 24px', color: '#008080' }}>
        Order Cancelled
      </Text>
      <Text style={{ margin: '0 0 15px', fontSize: '15px', color: '#222' }}>
        Hi {shippingAddress.first_name} {shippingAddress.last_name},
      </Text>
      <Text style={{ margin: '0 0 24px', color: '#222' }}>
        Your order <strong>#{order.display_id}</strong> has been cancelled. If you have any questions, please contact us.
      </Text>
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
      <Text style={{ margin: '24px 0 0', color: '#888', fontSize: '13px' }}>
        If you have any questions, reply to this email or contact us at {supportEmail}.
      </Text>
    </Section>
  </Base>
)

// Example preview data for local email previewer


