import { ReactNode } from 'react'
import { MedusaError } from '@medusajs/framework/utils'
import { InviteUserEmail, INVITE_USER, isInviteUserData } from './invite-user'
import { OrderPlacedTemplate, ORDER_PLACED, isOrderPlacedTemplateData } from './order-placed'
import {
  OrderShippedTemplate,
  OrderDeliveredTemplate,
  OrderCancelledTemplate,
  ORDER_SHIPPED,
  ORDER_DELIVERED,
  ORDER_CANCELLED
} from './order-status'
import { ContactFormEmail, CONTACT_FORM, isContactFormData } from './contact-form'

export const EmailTemplates = {
  INVITE_USER,
  ORDER_PLACED,
  ORDER_SHIPPED,
  ORDER_DELIVERED,
  ORDER_CANCELLED,
  CONTACT_FORM,
} as const

export type EmailTemplateType = keyof typeof EmailTemplates

export function generateEmailTemplate(templateKey: string, data: unknown): ReactNode {
  switch (templateKey) {
    case EmailTemplates.INVITE_USER:
      if (!isInviteUserData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.INVITE_USER}"`
        )
      }
      return <InviteUserEmail {...data} />

    case EmailTemplates.ORDER_PLACED:
      if (!isOrderPlacedTemplateData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.ORDER_PLACED}"`
        )
      }
      return <OrderPlacedTemplate {...data} />

    case EmailTemplates.ORDER_SHIPPED:
      return <OrderShippedTemplate {...(data as any)} />
    case EmailTemplates.ORDER_DELIVERED:
      return <OrderDeliveredTemplate {...(data as any)} />
    case EmailTemplates.ORDER_CANCELLED:
      return <OrderCancelledTemplate {...(data as any)} />

    case EmailTemplates.CONTACT_FORM:
      if (!isContactFormData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.CONTACT_FORM}"`
        )
      }
      return <ContactFormEmail {...data} />

    default:
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown template key: "${templateKey}"`
      )
  }
}

export { InviteUserEmail, OrderPlacedTemplate, ContactFormEmail }
