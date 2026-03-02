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
        <Text style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px', color: '#1a1a1a', textAlign: 'center' }}>
          New Contact Form Submission
        </Text>
        <Text style={{ fontSize: '14px', color: '#71717a', margin: '0 0 24px', textAlign: 'center' }}>
          A customer reached out via the website.
        </Text>

        <Hr style={{ borderColor: '#e4e4e7', margin: '0 0 20px' }} />

        <Text style={{ fontSize: '11px', color: '#a1a1aa', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
          From
        </Text>
        <Text style={{ fontSize: '15px', color: '#1a1a1a', margin: '0 0 16px' }}>
          {name} &lt;{email}&gt;
        </Text>

        {phone && (
          <>
            <Text style={{ fontSize: '11px', color: '#a1a1aa', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
              Phone
            </Text>
            <Text style={{ fontSize: '15px', color: '#1a1a1a', margin: '0 0 16px' }}>
              {phone}
            </Text>
          </>
        )}

        <Text style={{ fontSize: '11px', color: '#a1a1aa', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
          Subject
        </Text>
        <Text style={{ fontSize: '15px', color: '#1a1a1a', margin: '0 0 16px' }}>
          {subject || "General"}
        </Text>

        <Hr style={{ borderColor: '#e4e4e7', margin: '4px 0 20px' }} />

        <Text style={{ fontSize: '11px', color: '#a1a1aa', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
          Message
        </Text>
        <Text style={{ fontSize: '15px', color: '#1a1a1a', margin: '0 0 20px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
          {message}
        </Text>

        <Hr style={{ borderColor: '#e4e4e7', margin: '0 0 16px' }} />

        <Text style={{ fontSize: '12px', color: '#a1a1aa', margin: '0' }}>
          Reply directly to this email to respond to the customer.
        </Text>
        {timestamp && (
          <Text style={{ fontSize: '11px', color: '#d4d4d8', margin: '4px 0 0' }}>
            Submitted at {timestamp}
          </Text>
        )}
      </Section>
    </Base>
  )
}
