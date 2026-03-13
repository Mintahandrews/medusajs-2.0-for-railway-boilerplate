import { Text, Section, Button, Hr } from '@react-email/components'
import * as React from 'react'
import { Base } from './base'

export const CUSTOMER_WELCOME = 'customer-welcome'

export interface CustomerWelcomeProps {
  firstName: string
  storefrontUrl?: string
  supportEmail?: string
  preview?: string
}

export const isCustomerWelcomeData = (data: any): data is CustomerWelcomeProps =>
  typeof data.firstName === 'string'

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

export const CustomerWelcomeTemplate: React.FC<CustomerWelcomeProps> & { PreviewProps?: CustomerWelcomeProps } = ({
  firstName,
  storefrontUrl,
  supportEmail,
  preview = 'Welcome to Lets Case!',
}) => (
  <Base preview={preview}>
    <Section>
      <Text style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', margin: '0 0 8px', color: '#1a1a1a' }}>
        Welcome to Lets Case!
      </Text>
      <Text style={{ fontSize: '14px', textAlign: 'center', margin: '0 0 28px', color: '#71717a' }}>
        Your account is all set up.
      </Text>

      <Text style={{ margin: '0 0 16px', fontSize: '15px', color: '#27272a' }}>
        Hi {firstName},
      </Text>
      <Text style={{ margin: '0 0 24px', fontSize: '14px', color: '#3f3f46', lineHeight: '1.6' }}>
        Thanks for creating an account with Lets Case! You now have access to:
      </Text>

      <Section style={{ background: '#f4f4f5', borderRadius: 12, padding: '20px', margin: '0 0 24px' }}>
        <Text style={{ margin: '0 0 8px', fontSize: '14px', color: '#27272a' }}>
          &#x2713; Faster checkout with saved addresses
        </Text>
        <Text style={{ margin: '0 0 8px', fontSize: '14px', color: '#27272a' }}>
          &#x2713; Order history and tracking
        </Text>
        <Text style={{ margin: '0 0 8px', fontSize: '14px', color: '#27272a' }}>
          &#x2713; Wishlist to save your favourites
        </Text>
        <Text style={{ margin: '0', fontSize: '14px', color: '#27272a' }}>
          &#x2713; Exclusive deals and early access
        </Text>
      </Section>

      {storefrontUrl && (
        <Section style={{ textAlign: 'center', margin: '0 0 28px' }}>
          <Button href={storefrontUrl} style={btnStyle}>
            Start Shopping
          </Button>
        </Section>
      )}

      {supportEmail && (
        <>
          <Hr style={{ borderColor: '#e4e4e7', margin: '24px 0' }} />
          <Text style={{ margin: '0', fontSize: '13px', color: '#a1a1aa', lineHeight: '1.5' }}>
            Need help? Reply to this email or contact us at{' '}
            <span style={{ color: '#008080' }}>{supportEmail}</span>.
          </Text>
        </>
      )}
    </Section>
  </Base>
)

CustomerWelcomeTemplate.PreviewProps = {
  firstName: 'Kofi',
  storefrontUrl: 'https://letscasegh.com',
  supportEmail: 'support@letscase.com',
} as CustomerWelcomeProps

export default CustomerWelcomeTemplate
