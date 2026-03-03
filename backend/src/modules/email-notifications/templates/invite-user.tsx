import { Button, Link, Section, Text, Hr } from '@react-email/components'
import { Base } from './base'

/**
 * The key for the InviteUserEmail template, used to identify it
 */
export const INVITE_USER = 'invite-user'

/**
 * The props for the InviteUserEmail template
 */
export interface InviteUserEmailProps {
  /**
   * The link that the user can click to accept the invitation
   */
  inviteLink: string
  /**
   * The preview text for the email, appears next to the subject
   * in mail providers like Gmail
   */
  preview?: string
  /**
   * The POS role assigned to this user (admin, manager, cashier)
   */
  posRole?: string
}

/**
 * Type guard for checking if the data is of type InviteUserEmailProps
 * @param data - The data to check
 */
export const isInviteUserData = (data: any): data is InviteUserEmailProps =>
  typeof data.inviteLink === 'string' && (typeof data.preview === 'string' || !data.preview)

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

/**
 * The InviteUserEmail template component built with react-email
 */
const roleLabelMap: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  cashier: 'Cashier',
}

export const InviteUserEmail = ({
  inviteLink,
  preview = `You've been invited to Lets Case Admin`,
  posRole,
}: InviteUserEmailProps) => {
  const roleLabel = posRole ? roleLabelMap[posRole] || posRole : null
  return (
    <Base preview={preview}>
      <Section>
        <Text style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', margin: '0 0 8px', color: '#1a1a1a' }}>
          Admin Invitation
        </Text>
        <Text style={{ fontSize: '14px', textAlign: 'center', margin: '0 0 28px', color: '#71717a' }}>
          You&apos;ve been invited to join the team{roleLabel ? ` as ${roleLabel}` : ''}
        </Text>
        <Text style={{ margin: '0 0 24px', fontSize: '14px', color: '#3f3f46', lineHeight: '1.6' }}>
          You have been invited to be {roleLabel ? `a <strong>${roleLabel}</strong>` : 'an administrator'} on <strong>Lets Case</strong>. Click the button below to accept and set up your account.
        </Text>
        {roleLabel && (
          <Text style={{ margin: '0 0 24px', fontSize: '13px', color: '#71717a', lineHeight: '1.6', background: '#f4f4f5', borderRadius: '8px', padding: '12px 16px' }}>
            Your assigned role: <strong style={{ color: '#1a1a1a' }}>{roleLabel}</strong>. This role determines your access level in both the POS system and the admin dashboard.
          </Text>
        )}
        <Section style={{ textAlign: 'center', margin: '0 0 28px' }}>
          <Button href={inviteLink} style={btnStyle}>
            Accept Invitation
          </Button>
        </Section>
        <Text style={{ margin: '0 0 8px', fontSize: '13px', color: '#71717a' }}>
          Or copy and paste this URL into your browser:
        </Text>
        <Text style={{ maxWidth: '100%', wordBreak: 'break-all', overflowWrap: 'break-word', margin: '0 0 0' }}>
          <Link href={inviteLink} style={{ color: '#008080', textDecoration: 'none', fontSize: '13px' }}>
            {inviteLink}
          </Link>
        </Text>
      </Section>
      <Hr style={{ borderColor: '#e4e4e7', margin: '24px 0' }} />
      <Text style={{ margin: '0', fontSize: '12px', color: '#a1a1aa', lineHeight: '1.6' }}>
        If you were not expecting this invitation, you can ignore this email. The
        invitation will expire in 24 hours. If you are concerned about your account&apos;s safety,
        please reply to this email to get in touch with us.
      </Text>
    </Base>
  )
}

InviteUserEmail.PreviewProps = {
  inviteLink: 'https://admin.letscasegh.com/app/invite?token=abc123',
  posRole: 'manager',
} as InviteUserEmailProps

export default InviteUserEmail
