import { Text, Section, Hr, Button } from '@react-email/components'
import * as React from 'react'
import { Base } from './base'
import { OrderDTO, OrderAddressDTO } from '@medusajs/framework/types'

export const ORDER_PLACED = 'order-placed'

interface OrderPlacedPreviewProps {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  shippingAddress: OrderAddressDTO
}

export interface OrderPlacedTemplateProps {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  shippingAddress: OrderAddressDTO
  preview?: string
}

export const isOrderPlacedTemplateData = (data: any): data is OrderPlacedTemplateProps =>
  typeof data.order === 'object' && typeof data.shippingAddress === 'object'

export const OrderPlacedTemplate: React.FC<OrderPlacedTemplateProps> & {
  PreviewProps: OrderPlacedPreviewProps
} = ({ order, shippingAddress, preview = 'Your Letscase order has been confirmed!' }) => {
  return (
    <Base preview={preview}>
      <Section>
        {/* Success Icon */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            backgroundColor: '#E6F3F3',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ fontSize: '24px', margin: 0 }}>✓</Text>
          </div>
        </div>

        <Text style={{
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          margin: '0 0 10px',
          color: '#1a1a1a'
        }}>
          Order Confirmed!
        </Text>

        <Text style={{
          textAlign: 'center',
          color: '#666',
          margin: '0 0 30px',
          fontSize: '14px'
        }}>
          Thank you for shopping with Letscase
        </Text>

        <Text style={{ margin: '0 0 15px', color: '#333' }}>
          Dear {shippingAddress.first_name} {shippingAddress.last_name},
        </Text>

        <Text style={{ margin: '0 0 30px', color: '#555', lineHeight: '1.6' }}>
          Great news! Your order has been confirmed and is being processed.
          We&apos;ll notify you when it ships.
        </Text>

        {/* Order Info Card */}
        <div style={{
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <Text style={{
            fontSize: '16px',
            fontWeight: 'bold',
            margin: '0 0 15px',
            color: '#4A9B9B'
          }}>
            Order Details
          </Text>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <Text style={{ margin: 0, color: '#666', fontSize: '14px' }}>Order ID:</Text>
            <Text style={{ margin: 0, fontWeight: 'bold', color: '#333', fontSize: '14px' }}>{order.display_id}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <Text style={{ margin: 0, color: '#666', fontSize: '14px' }}>Order Date:</Text>
            <Text style={{ margin: 0, color: '#333', fontSize: '14px' }}>{new Date(order.created_at).toLocaleDateString()}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text style={{ margin: 0, color: '#666', fontSize: '14px' }}>Total:</Text>
            <Text style={{ margin: 0, fontWeight: 'bold', color: '#4A9B9B', fontSize: '16px' }}>
              {order.currency_code.toUpperCase()} {order.summary.raw_current_order_total.value.toFixed(2)}
            </Text>
          </div>
        </div>

        <Hr style={{ margin: '20px 0', borderColor: '#eee' }} />

        {/* Shipping Address */}
        <Text style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px', color: '#4A9B9B' }}>
          Shipping Address
        </Text>
        <Text style={{ margin: '0 0 5px', color: '#555', fontSize: '14px' }}>
          {shippingAddress.address_1}
        </Text>
        <Text style={{ margin: '0 0 5px', color: '#555', fontSize: '14px' }}>
          {shippingAddress.city}{shippingAddress.province && `, ${shippingAddress.province}`} {shippingAddress.postal_code}
        </Text>
        <Text style={{ margin: '0 0 20px', color: '#555', fontSize: '14px' }}>
          {shippingAddress.country_code?.toUpperCase()}
        </Text>

        <Hr style={{ margin: '20px 0', borderColor: '#eee' }} />

        {/* Order Items */}
        <Text style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 15px', color: '#4A9B9B' }}>
          Order Items
        </Text>

        {order.items.map((item) => (
          <div key={item.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 0',
            borderBottom: '1px solid #eee'
          }}>
            <div>
              <Text style={{ margin: 0, fontWeight: '500', color: '#333', fontSize: '14px' }}>{item.product_title}</Text>
              <Text style={{ margin: '4px 0 0', color: '#888', fontSize: '12px' }}>{item.title} × {item.quantity}</Text>
            </div>
            <Text style={{ margin: 0, fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
              {order.currency_code.toUpperCase()} {(item.unit_price * item.quantity).toFixed(2)}
            </Text>
          </div>
        ))}

        {/* CTA Button */}
        <Section className="mt-8 text-center">
          <Button
            className="bg-[#4A9B9B] rounded-full text-white text-[14px] font-semibold no-underline px-8 py-4"
            href="https://letscase.com/account/orders"
          >
            View Order Status
          </Button>
        </Section>

        <Text style={{
          textAlign: 'center',
          color: '#888',
          fontSize: '12px',
          marginTop: '30px',
          lineHeight: '1.5'
        }}>
          Questions about your order? Contact us at{' '}
          <a href="mailto:support@letscase.com" style={{ color: '#4A9B9B' }}>support@letscase.com</a>
        </Text>
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
    currency_code: 'GHS',
    items: [
      { id: 'item-1', title: 'Black', product_title: 'iPhone 15 Pro Case', quantity: 2, unit_price: 45 },
      { id: 'item-2', title: 'White', product_title: 'USB-C Fast Charger 65W', quantity: 1, unit_price: 120 }
    ],
    shipping_address: {
      first_name: 'Kwame',
      last_name: 'Asante',
      address_1: '25 Independence Avenue',
      city: 'Accra',
      province: 'Greater Accra',
      postal_code: '',
      country_code: 'GH'
    },
    summary: { raw_current_order_total: { value: 210 } }
  },
  shippingAddress: {
    first_name: 'Kwame',
    last_name: 'Asante',
    address_1: '25 Independence Avenue',
    city: 'Accra',
    province: 'Greater Accra',
    postal_code: '',
    country_code: 'GH'
  }
} as OrderPlacedPreviewProps

export default OrderPlacedTemplate
