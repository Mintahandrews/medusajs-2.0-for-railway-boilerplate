import { Text, Section, Hr } from "@react-email/components"
import * as React from "react"
import { Base } from "./base"

export const CONTACT_FORM = "contact-form"

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  timestamp?: string
}

export function isContactFormData(data: unknown): data is ContactFormData {
  if (!data || typeof data !== "object") return false
  const d = data as Record<string, unknown>
  return (
    typeof d.name === "string" &&
    typeof d.email === "string" &&
    typeof d.message === "string"
  )
}

/**
 * Email sent to the support inbox when a customer submits the contact form.
 */
export const ContactFormEmail: React.FC<ContactFormData> = ({
  name,
  email,
  phone,
  subject,
  message,
  timestamp,
}) => {
  return (
    <Base preview={`New contact form message from ${name}`}>
      <Section>
        <Text className="text-[22px] font-bold text-[#1a1a1a] leading-[1.3] mt-0 mb-1">
          New Contact Form Submission
        </Text>
        <Text className="text-[14px] text-[#666] mt-0 mb-4">
          A customer reached out via the contact form on the website.
        </Text>

        <Hr className="border-[#eaeaea] my-4" />

        <Text className="text-[13px] text-[#999] mt-0 mb-[2px] uppercase tracking-wider font-semibold">
          From
        </Text>
        <Text className="text-[15px] text-[#1a1a1a] mt-0 mb-3">
          {name} &lt;{email}&gt;
        </Text>

        {phone && (
          <>
            <Text className="text-[13px] text-[#999] mt-0 mb-[2px] uppercase tracking-wider font-semibold">
              Phone
            </Text>
            <Text className="text-[15px] text-[#1a1a1a] mt-0 mb-3">
              {phone}
            </Text>
          </>
        )}

        <Text className="text-[13px] text-[#999] mt-0 mb-[2px] uppercase tracking-wider font-semibold">
          Subject
        </Text>
        <Text className="text-[15px] text-[#1a1a1a] mt-0 mb-3">
          {subject || "General"}
        </Text>

        <Hr className="border-[#eaeaea] my-4" />

        <Text className="text-[13px] text-[#999] mt-0 mb-[2px] uppercase tracking-wider font-semibold">
          Message
        </Text>
        <Text className="text-[15px] text-[#1a1a1a] mt-0 mb-4 whitespace-pre-wrap leading-[1.6]">
          {message}
        </Text>

        <Hr className="border-[#eaeaea] my-4" />

        <Text className="text-[12px] text-[#999] mt-0 mb-0">
          Reply directly to this email to respond to the customer.
        </Text>
        {timestamp && (
          <Text className="text-[11px] text-[#bbb] mt-1 mb-0">
            Submitted at {timestamp}
          </Text>
        )}
      </Section>
    </Base>
  )
}
