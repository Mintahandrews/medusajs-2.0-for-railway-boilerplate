import { Button, Link, Section, Text, Hr } from '@react-email/components'
import { Base } from './base'

export const PASSWORD_RESET = 'password-reset'

export interface PasswordResetEmailProps {
  resetLink: string
  preview?: string
}

export const isPasswordResetData = (data: any): data is PasswordResetEmailProps =>
  typeof data.resetLink === 'string'

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

export const PasswordResetEmail = ({
  resetLink,
  preview = 'Reset your Lets Case password',
}: PasswordResetEmailProps) => {
  return (
    <Base preview={preview}>
      <Section>
        <Text style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', margin: '0 0 8px', color: '#1a1a1a' }}>
          Reset Your Password
        </Text>
        <Text style={{ fontSize: '14px', textAlign: 'center', margin: '0 0 28px', color: '#71717a' }}>
          We received a request to reset your password
        </Text>
        <Text style={{ margin: '0 0 24px', fontSize: '14px', color: '#3f3f46', lineHeight: '1.6' }}>
          Click the button below to set a new password for your <strong>Lets Case</strong> account.
          This link will expire in 15 minutes.
        </Text>
        <Section style={{ textAlign: 'center', margin: '0 0 28px' }}>
          <Button href={resetLink} style={btnStyle}>
            Reset Password
          </Button>
        </Section>
        <Text style={{ margin: '0 0 8px', fontSize: '13px', color: '#71717a' }}>
          Or copy and paste this URL into your browser:
        </Text>
        <Text style={{ maxWidth: '100%', wordBreak: 'break-all', overflowWrap: 'break-word', margin: '0 0 0' }}>
          <Link href={resetLink} style={{ color: '#008080', textDecoration: 'none', fontSize: '13px' }}>
            {resetLink}
          </Link>
        </Text>
      </Section>
      <Hr style={{ borderColor: '#e4e4e7', margin: '24px 0' }} />
      <Text style={{ margin: '0', fontSize: '12px', color: '#a1a1aa', lineHeight: '1.6' }}>
        If you didn&apos;t request a password reset, you can safely ignore this email.
        Your password will not be changed. If you are concerned about your account&apos;s
        safety, please reply to this email to get in touch with us.
      </Text>
    </Base>
  )
}

PasswordResetEmail.PreviewProps = {
  resetLink: 'https://letscasegh.com/gh/reset-password?token=abc123&email=customer@gmail.com',
} as PasswordResetEmailProps

export default PasswordResetEmail
