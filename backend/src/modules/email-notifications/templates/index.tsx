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
import { CustomerWelcomeTemplate, CUSTOMER_WELCOME, isCustomerWelcomeData } from './customer-welcome'
import { OrderRefundTemplate, ORDER_REFUND, isOrderRefundData } from './order-refund'
import { ReturnCreatedTemplate, RETURN_CREATED, isReturnCreatedData } from './return-created'
import { PasswordResetEmail, PASSWORD_RESET, isPasswordResetData } from './password-reset'

export const EmailTemplates = {
  INVITE_USER,
  ORDER_PLACED,
  ORDER_SHIPPED,
  ORDER_DELIVERED,
  ORDER_CANCELLED,
  CONTACT_FORM,
  CUSTOMER_WELCOME,
  ORDER_REFUND,
  RETURN_CREATED,
  PASSWORD_RESET,
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

    case EmailTemplates.CUSTOMER_WELCOME:
      if (!isCustomerWelcomeData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.CUSTOMER_WELCOME}"`
        )
      }
      return <CustomerWelcomeTemplate {...data} />

    case EmailTemplates.ORDER_REFUND:
      if (!isOrderRefundData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.ORDER_REFUND}"`
        )
      }
      return <OrderRefundTemplate {...data} />

    case EmailTemplates.RETURN_CREATED:
      if (!isReturnCreatedData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.RETURN_CREATED}"`
        )
      }
      return <ReturnCreatedTemplate {...data} />

    case EmailTemplates.PASSWORD_RESET:
      if (!isPasswordResetData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.PASSWORD_RESET}"`
        )
      }
      return <PasswordResetEmail {...data} />

    default:
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown template key: "${templateKey}"`
      )
  }
}

export {
  InviteUserEmail,
  OrderPlacedTemplate,
  ContactFormEmail,
  CustomerWelcomeTemplate,
  OrderRefundTemplate,
  ReturnCreatedTemplate,
  PasswordResetEmail,
}
