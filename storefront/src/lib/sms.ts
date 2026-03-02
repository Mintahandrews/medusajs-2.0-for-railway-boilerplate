/**
 * SMSOnlineGH integration utility
 * API Docs: https://dev.smsonlinegh.com/docs/v5/http/rest/messaging/sms_non_personalised.html
 *
 * Required env vars:
 *   SMSONLINEGH_API_KEY  – API key from your SMSOnlineGH dashboard
 *   SMSONLINEGH_SENDER   – Approved sender ID (e.g. "Letscase")
 *
 * IMPORTANT: All SMS templates MUST use only GSM 7-bit characters.
 * NO emojis, NO smart/curly quotes (' ' " "), NO special Unicode.
 * Use plain apostrophe (') and plain quotes (").
 * Max 160 chars per segment — keep messages concise.
 */

const API_URL = "https://api.smsonlinegh.com/v5/message/sms/send"

const getApiKey = () => process.env.SMSONLINEGH_API_KEY || ""
const getSender = () => process.env.SMSONLINEGH_SENDER || "Letscase"
const getWhatsApp = () =>
  (process.env.STORE_WHATSAPP || "").trim() || "+233540451001"

export interface SMSSendResult {
  success: boolean
  batch?: string
  error?: string
  destinations?: Array<{
    id: string
    to: string
    status: { id: number; label: string }
  }>
}

/**
 * Normalise a Ghana phone number to international format (233xxxxxxxxx).
 * Accepts: 0241234567, +233241234567, 233241234567
 */
export function normalizeGhanaPhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-()]/g, "")
  if (cleaned.startsWith("+")) cleaned = cleaned.slice(1)
  if (cleaned.startsWith("0")) cleaned = "233" + cleaned.slice(1)
  if (!cleaned.startsWith("233")) cleaned = "233" + cleaned
  return cleaned
}

/**
 * Check if a string looks like a phone number (not an email).
 */
export function isPhoneNumber(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed.includes("@")) return false
  // Ghana numbers: starts with 0, +233, or 233, followed by digits
  return /^(\+?233|0)\d{9,}$/.test(trimmed.replace(/[\s\-()]/g, ""))
}

/**
 * Convert a phone number to a synthetic email for Medusa's emailpass auth.
 * This allows phone-based auth while the backend still uses email internally.
 */
export function phoneToSyntheticEmail(phone: string): string {
  const normalized = normalizeGhanaPhone(phone)
  return `phone_${normalized}@sms.letscase.com`
}

/**
 * Extract original phone from a synthetic email. Returns null if not synthetic.
 */
export function syntheticEmailToPhone(email: string): string | null {
  const match = email.match(/^phone_(233\d+)@sms\.letscase\.com$/)
  return match ? match[1] : null
}

/**
 * Send an SMS message via SMSOnlineGH API.
 */
export async function sendSMS(
  destinations: string[],
  text: string
): Promise<SMSSendResult> {
  const apiKey = getApiKey()
  if (!apiKey) {
    console.warn("[sms] SMSONLINEGH_API_KEY not set — skipping SMS send")
    return { success: false, error: "SMS API key not configured" }
  }

  const normalized = destinations.map(normalizeGhanaPhone)

  const body = {
    text,
    type: 0, // GSM default encoding
    sender: getSender(),
    destinations: normalized,
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `key ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error")
      console.error("[sms] HTTP error:", res.status, errorText)
      return { success: false, error: `HTTP ${res.status}: ${errorText}` }
    }

    const json = await res.json()

    if (json.handshake?.id !== 0 || json.handshake?.label !== "HSHK_OK") {
      console.error("[sms] Handshake failed:", json.handshake)
      return {
        success: false,
        error: `Handshake error: ${json.handshake?.label || "Unknown"}`,
      }
    }

    console.log("[sms] Sent successfully, batch:", json.data?.batch)
    return {
      success: true,
      batch: json.data?.batch,
      destinations: json.data?.destinations,
    }
  } catch (err: any) {
    console.error("[sms] Network error:", err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Send a welcome SMS to a new customer.
 */
export async function sendWelcomeSMS(phone: string, firstName: string) {
  const wa = getWhatsApp()
  return sendSMS(
    [phone],
    `Welcome to Letscase, ${firstName}! Your account is ready. Shop premium cases & accessories at letscase.com. Need help? WhatsApp us at ${wa}`
  )
}

/**
 * Send an OTP verification SMS.
 */
export async function sendOTPSMS(phone: string, otp: string) {
  return sendSMS(
    [phone],
    `Your Letscase code is ${otp}. It expires in 10 minutes. Do not share this code with anyone.`
  )
}

/**
 * Send an order confirmation SMS.
 */
export async function sendOrderConfirmationSMS(
  phone: string,
  orderId: string,
  total?: string
) {
  const totalPart = total ? ` Total: ${total}.` : ""
  return sendSMS(
    [phone],
    `Letscase order #${orderId} confirmed!${totalPart} We will notify you when it ships. Track at letscase.com/order-tracking`
  )
}

/**
 * Send an SMS to notify the store owner about a contact form submission.
 */
export async function sendContactNotificationSMS(
  storePhone: string,
  customerName: string,
  subject: string,
  customerPhone?: string
) {
  const phonePart = customerPhone ? ` Ph: ${customerPhone}.` : ""
  return sendSMS(
    [storePhone],
    `New message from ${customerName} - ${subject}.${phonePart} Check email or admin for details.`
  )
}

/**
 * Send an SMS auto-reply to the customer after they submit the contact form.
 */
export async function sendContactAutoReplySMS(
  phone: string,
  customerName: string
) {
  const wa = getWhatsApp()
  return sendSMS(
    [phone],
    `Hi ${customerName}, we got your message! Our team will reply within 24hrs. For faster help, WhatsApp us at ${wa}`
  )
}

/**
 * Send an order shipped SMS.
 */
export async function sendOrderShippedSMS(
  phone: string,
  orderId: string,
  trackingInfo?: string
) {
  const trackingPart = trackingInfo
    ? ` Tracking: ${trackingInfo}.`
    : " Track at letscase.com/order-tracking"
  return sendSMS(
    [phone],
    `Your Letscase order #${orderId} has been shipped!${trackingPart}`
  )
}

/**
 * Send a newsletter subscription confirmation SMS.
 */
export async function sendNewsletterSMS(phone: string) {
  return sendSMS(
    [phone],
    `Subscribed to Letscase! You will get exclusive deals and new arrivals via SMS. Reply STOP to unsubscribe.`
  )
}
