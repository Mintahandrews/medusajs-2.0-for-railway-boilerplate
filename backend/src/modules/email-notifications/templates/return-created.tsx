import { Text, Section, Button, Hr } from '@react-email/components'
import * as React from 'react'
import { Base } from './base'

export const RETURN_CREATED = 'return-created'

export interface ReturnCreatedProps {
  order: { id: string; display_id: string }
  shippingAddress: { first_name?: string; last_name?: string; country_code?: string }
  returnId?: string
  orderUrl?: string
  supportEmail?: string
  preview?: string
}

export const isReturnCreatedData = (data: any): data is ReturnCreatedProps =>
  typeof data.order === 'object'

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

export const ReturnCreatedTemplate: React.FC<ReturnCreatedProps> & { PreviewProps?: ReturnCreatedProps } = ({
  order,
  shippingAddress,
  returnId,
  orderUrl,
  supportEmail,
  preview = 'Your return request has been received.',
}) => (
  <Base preview={preview}>
    <Section>
      <Text style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', margin: '0 0 8px', color: '#1a1a1a' }}>
        Return Request Received
      </Text>
      <Text style={{ fontSize: '14px', textAlign: 'center', margin: '0 0 28px', color: '#71717a' }}>
        We&apos;re processing your return.
      </Text>

      <Text style={{ margin: '0 0 16px', fontSize: '15px', color: '#27272a' }}>
        Hi {shippingAddress.first_name || 'Customer'},
      </Text>
      <Text style={{ margin: '0 0 24px', fontSize: '14px', color: '#3f3f46', lineHeight: '1.6' }}>
        We have received your return request for order <strong>#{order.display_id}</strong>.
        Our team will review it and get back to you shortly.
      </Text>

      <Section style={{ background: '#f4f4f5', borderRadius: 12, padding: '20px', margin: '0 0 24px' }}>
        <Text style={{ fontSize: '11px', fontWeight: 600, margin: '0 0 12px', color: '#a1a1aa', letterSpacing: '1px', textTransform: 'uppercase' }}>
          What Happens Next
        </Text>
        <Text style={{ margin: '0 0 8px', fontSize: '14px', color: '#27272a', lineHeight: '1.6' }}>
          1. Our team reviews your request (1&ndash;2 business days)
        </Text>
        <Text style={{ margin: '0 0 8px', fontSize: '14px', color: '#27272a', lineHeight: '1.6' }}>
          2. You&apos;ll receive return shipping instructions
        </Text>
        <Text style={{ margin: '0', fontSize: '14px', color: '#27272a', lineHeight: '1.6' }}>
          3. Refund is processed once we receive the item
        </Text>
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
            Questions about your return? Reply to this email or contact us at{' '}
            <span style={{ color: '#008080' }}>{supportEmail}</span>.
          </Text>
        </>
      )}
    </Section>
  </Base>
)

ReturnCreatedTemplate.PreviewProps = {
  order: { id: 'test-id', display_id: 'ORD-789' },
  shippingAddress: { first_name: 'Ama', last_name: 'Osei', country_code: 'gh' },
  orderUrl: 'https://letscasegh.com/gh/order/confirmed/test-id',
  supportEmail: 'support@letscase.com',
} as ReturnCreatedProps

export default ReturnCreatedTemplate
