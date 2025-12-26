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
}

/**
 * Type guard for checking if the data is of type InviteUserEmailProps
 * @param data - The data to check
 */
export const isInviteUserData = (data: any): data is InviteUserEmailProps =>
  typeof data.inviteLink === 'string' && (typeof data.preview === 'string' || !data.preview)

/**
 * The InviteUserEmail template component built with react-email
 */
export const InviteUserEmail = ({
  inviteLink,
  preview = `You've been invited to Letscase Admin!`,
}: InviteUserEmailProps) => {
  return (
    <Base preview={preview}>
      <Section className="text-center">
        <Text className="text-gray-800 text-[20px] font-bold leading-[28px] mb-4">
          Admin Invitation
        </Text>
        <Text className="text-gray-600 text-[14px] leading-[24px] mb-6">
          You&apos;ve been invited to join the <strong className="text-[#4A9B9B]">Letscase</strong> admin team.
          Click the button below to accept your invitation and set up your account.
        </Text>

        <Section className="mt-4 mb-[32px]">
          <Button
            className="bg-[#4A9B9B] rounded-full text-white text-[14px] font-semibold no-underline px-8 py-4"
            href={inviteLink}
          >
            Accept Invitation
          </Button>
        </Section>

        <Text className="text-gray-500 text-[13px] leading-[22px]">
          Or copy and paste this URL into your browser:
        </Text>
        <Text style={{
          maxWidth: '100%',
          wordBreak: 'break-all',
          overflowWrap: 'break-word'
        }}>
          <Link
            href={inviteLink}
            className="text-[#4A9B9B] no-underline text-[12px]"
          >
            {inviteLink}
          </Link>
        </Text>
      </Section>

      <Hr className="border border-solid border-gray-200 my-[24px] mx-0 w-full" />

      <Text className="text-gray-400 text-[11px] leading-[20px] text-center">
        If you were not expecting this invitation, you can ignore this email.
        The invitation will expire in 24 hours. If you are concerned about your
        account&apos;s safety, please contact us at support@letscase.com.
      </Text>
    </Base>
  )
}

InviteUserEmail.PreviewProps = {
  inviteLink: 'https://admin.letscase.com/invite?token=abc123'
} as InviteUserEmailProps

export default InviteUserEmail
