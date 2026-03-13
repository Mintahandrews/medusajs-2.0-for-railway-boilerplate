/**
 * Plain-text SMS templates.
 *
 * Each function returns a short string (<160 chars where possible) suitable for
 * a single SMS segment. If data is missing the template gracefully degrades.
 */

// Re-use the same template key constants from the email module so subscribers
// can pass the same `template` value for both channels.
export const SmsTemplates = {
  ORDER_PLACED: 'order-placed',
  ORDER_SHIPPED: 'order-shipped',
  ORDER_DELIVERED: 'order-delivered',
  ORDER_CANCELLED: 'order-cancelled',
  INVITE_USER: 'invite-user',
  CUSTOMER_WELCOME: 'customer-welcome',
  ORDER_REFUND: 'order-refund',
  RETURN_CREATED: 'return-created',
} as const

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const NO_DIVISION_CURRENCIES = new Set([
  'krw', 'jpy', 'vnd', 'clp', 'pyg', 'xaf', 'xof', 'bif',
  'djf', 'gnf', 'kmf', 'mga', 'rwf', 'xpf', 'htg', 'vuv',
])

function toNumber(value: any): number {
  if (value == null) return 0
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatMoney(amount: any, currencyCode?: string): string {
  const cc = (currencyCode ?? '').toLowerCase()
  const raw = toNumber(amount)
  const value = NO_DIVISION_CURRENCIES.has(cc) ? raw : raw / 100
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: cc.toUpperCase(),
      currencyDisplay: 'symbol',
    }).format(value)
  } catch {
    return `${value.toFixed(2)} ${cc.toUpperCase()}`.trim()
  }
}

/* ------------------------------------------------------------------ */
/*  Template generator                                                */
/* ------------------------------------------------------------------ */

export function generateSmsText(templateKey: string, data: any): string {
  const name = data?.shippingAddress?.first_name || data?.order?.shipping_address?.first_name || 'Customer'
  const orderId = data?.order?.display_id || ''

  switch (templateKey) {
    case SmsTemplates.ORDER_PLACED: {
      const total = data?.order?.summary?.raw_current_order_total?.value
      const currency = data?.order?.currency_code
      const moneyStr = total != null ? ` Total: ${formatMoney(total, currency)}.` : ''
      return `Hi ${name}, your Lets Case order #${orderId} is confirmed!${moneyStr} We'll notify you when it ships.`
    }

    case SmsTemplates.ORDER_SHIPPED:
      return `Hi ${name}, your order #${orderId} has shipped and is on its way! You'll get an update when it's delivered.`

    case SmsTemplates.ORDER_DELIVERED:
      return `Hi ${name}, your order #${orderId} has been delivered. Enjoy your new case! Contact us if you need help.`

    case SmsTemplates.ORDER_CANCELLED:
      return `Hi ${name}, your order #${orderId} has been cancelled. If you made a payment, the refund will be processed in 5-7 business days.`

    case SmsTemplates.INVITE_USER: {
      const role = data?.posRole ? ` as ${data.posRole}` : ''
      const link = data?.inviteLink || ''
      return `You've been invited to Lets Case Admin${role}. Accept here: ${link}`
    }

    case SmsTemplates.CUSTOMER_WELCOME: {
      const custName = data?.firstName || 'there'
      return `Welcome to Lets Case, ${custName}! Your account is ready. Shop premium cases & accessories at letscase.com. Need help? WhatsApp us at +233540451001`
    }

    case SmsTemplates.ORDER_REFUND: {
      const refundOrderId = data?.order?.display_id || ''
      const refundAmt = data?.refundAmount
      const refundCurrency = data?.order?.currency_code
      const refundStr = refundAmt != null ? ` of ${formatMoney(refundAmt, refundCurrency)}` : ''
      return `Hi ${name}, a refund${refundStr} has been processed for order #${refundOrderId}. It should appear in your account within 5-7 business days.`
    }

    case SmsTemplates.RETURN_CREATED:
      return `Hi ${name}, your return request for order #${orderId} has been received. Our team will review it and get back to you within 1-2 business days.`

    default:
      return `Lets Case notification: ${templateKey}`
  }
}
