import { NextRequest, NextResponse } from "next/server"
import {
  sendContactNotificationSMS,
  sendContactAutoReplySMS,
  isPhoneNumber,
} from "@lib/sms"

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const SUPPORT_EMAIL =
  (process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "").trim() || "support@letscase.com"

const STORE_PHONE = (process.env.STORE_PHONE || "").trim() || "+233540451001"

/**
 * Optional: if the storefront has its own RESEND_API_KEY we can send
 * the email directly as a fallback when the backend is unreachable.
 */
const RESEND_API_KEY = (process.env.RESEND_API_KEY || "").trim()
const RESEND_FROM = (process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || "").trim()

// ───────── helpers ─────────

interface ContactPayload {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

function validate(body: Record<string, unknown>): ContactPayload | string {
  const { name, email, subject, message, phone } = body as Record<string, string | undefined>

  if (!name?.trim()) return "Name is required."
  if (!message?.trim()) return "Message is required."

  const trimmedEmail = email?.trim() || ""
  const trimmedPhone = phone?.trim() || ""

  // Require at least one contact method
  if (!trimmedEmail && !trimmedPhone) {
    return "Please provide an email address or phone number."
  }

  // If email is provided, it must be valid
  if (trimmedEmail && !trimmedEmail.includes("@")) {
    return "Please enter a valid email address."
  }

  return {
    name: name.trim(),
    email: trimmedEmail || `phone_user@contact.letscase.com`,
    phone: trimmedPhone || undefined,
    subject: subject?.trim() || "General",
    message: message.trim(),
  }
}

/**
 * Try to send via the Medusa backend notification module (Resend / SendGrid).
 * Returns true on success.
 */
async function sendViaMedusa(payload: ContactPayload): Promise<boolean> {
  try {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/custom/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(PUBLISHABLE_KEY
          ? { "x-publishable-api-key": PUBLISHABLE_KEY }
          : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000), // 10 s timeout
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Fallback: send directly via Resend REST API from the storefront.
 * Only available when RESEND_API_KEY is set on the storefront side.
 */
async function sendViaResendDirect(payload: ContactPayload): Promise<boolean> {
  if (!RESEND_API_KEY) return false
  try {
    const from = RESEND_FROM || `Letscase Contact <${SUPPORT_EMAIL}>`
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: SUPPORT_EMAIL,
        reply_to: payload.email,
        subject: `[Contact] ${payload.subject} — from ${payload.name}`,
        html: buildHtml(payload),
      }),
      signal: AbortSignal.timeout(10_000),
    })
    return res.ok
  } catch {
    return false
  }
}

/** Minimal HTML email for the direct-Resend fallback — matches backend template styling. */
function buildHtml(p: ContactPayload): string {
  const LOGO = 'https://letscasegh.com/Lets%20Case%20Logo%20black.png'
  const SITE = 'https://letscasegh.com'
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;overflow:hidden">
      <div style="padding:32px 24px 20px;text-align:center;background:#ffffff">
        <a href="${SITE}" style="text-decoration:none">
          <img src="${LOGO}" alt="Lets Case" width="100" height="100" style="display:block;margin:0 auto;width:100px;height:100px;object-fit:contain" />
        </a>
        <p style="margin:12px 0 0;font-size:11px;color:#a1a1aa;letter-spacing:2px;text-transform:uppercase;font-weight:600">Premium Phone Cases &amp; Tech Accessories</p>
      </div>
      <hr style="border:none;border-top:1px solid #e4e4e7;margin:0" />
      <div style="padding:20px 24px 24px">
        <h2 style="font-size:24px;font-weight:700;text-align:center;margin:0 0 8px;color:#1a1a1a">New Contact Form Submission</h2>
        <p style="font-size:14px;text-align:center;color:#71717a;margin:0 0 24px">A customer reached out via the website.</p>
        <hr style="border:none;border-top:1px solid #e4e4e7;margin:0 0 20px" />
        <p style="font-size:11px;color:#a1a1aa;margin:0 0 2px;text-transform:uppercase;letter-spacing:1px;font-weight:600">From</p>
        <p style="font-size:15px;color:#1a1a1a;margin:0 0 16px">${esc(p.name)} &lt;${esc(p.email)}&gt;</p>
        ${p.phone ? `<p style="font-size:11px;color:#a1a1aa;margin:0 0 2px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Phone</p><p style="font-size:15px;color:#1a1a1a;margin:0 0 16px">${esc(p.phone)}</p>` : ""}
        <p style="font-size:11px;color:#a1a1aa;margin:0 0 2px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Subject</p>
        <p style="font-size:15px;color:#1a1a1a;margin:0 0 16px">${esc(p.subject)}</p>
        <hr style="border:none;border-top:1px solid #e4e4e7;margin:4px 0 20px" />
        <p style="font-size:11px;color:#a1a1aa;margin:0 0 2px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Message</p>
        <p style="font-size:15px;color:#1a1a1a;white-space:pre-wrap;line-height:1.6;margin:0 0 20px">${esc(p.message)}</p>
        <hr style="border:none;border-top:1px solid #e4e4e7;margin:0 0 16px" />
        <p style="font-size:12px;color:#a1a1aa;margin:0">Reply directly to this email to respond to the customer.</p>
      </div>
      <hr style="border:none;border-top:1px solid #e4e4e7;margin:0" />
      <div style="padding:20px 24px;text-align:center;background:#fafafa">
        <p style="margin:0 0 8px;font-size:12px;color:#71717a;font-weight:500">Lets Case Ghana &middot; Accra</p>
        <p style="margin:0 0 12px;font-size:11px;color:#a1a1aa">
          <a href="${SITE}" style="color:#008080;text-decoration:none">letscasegh.com</a> &middot;
          <a href="https://wa.me/233540451001" style="color:#008080;text-decoration:none">WhatsApp</a> &middot;
          <a href="https://www.instagram.com/letscasegh" style="color:#008080;text-decoration:none">Instagram</a>
        </p>
        <p style="margin:0;font-size:10px;color:#d4d4d8">&copy; ${new Date().getFullYear()} Lets Case. All rights reserved.</p>
      </div>
    </div>
  `.trim()
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

// ───────── handler ─────────

/**
 * POST /api/contact
 *
 * 1. Validates the request body.
 * 2. Tries to send via the Medusa backend notification module (Resend/SendGrid).
 * 3. If that fails, tries to send directly via Resend (if API key is set on storefront).
 * 4. Always logs the submission to the server console as a final safety net.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = validate(body)

    if (typeof result === "string") {
      return NextResponse.json({ error: result }, { status: 400 })
    }

    // Always log so submissions are never lost
    console.info("[contact-form]", {
      ...result,
      message: result.message.slice(0, 500),
      timestamp: new Date().toISOString(),
    })

    // ── Email notification ──
    // Strategy 1: Medusa backend (uses Resend/SendGrid via notification module)
    const sentViaMedusa = await sendViaMedusa(result)

    if (!sentViaMedusa) {
      // Strategy 2: Direct Resend from the storefront
      const sentDirect = await sendViaResendDirect(result)

      if (!sentDirect) {
        console.warn(
          "[contact-form] Both Medusa and direct-Resend delivery failed. " +
          "Submission was logged above."
        )
      }
    }

    // ── SMS notifications (fire-and-forget, non-blocking) ──
    const smsPromises: Promise<unknown>[] = []

    // Notify store owner via SMS about the new contact submission
    smsPromises.push(
      sendContactNotificationSMS(
        STORE_PHONE,
        result.name,
        result.subject,
        result.phone
      ).catch((err) =>
        console.warn("[contact-form] Store SMS notification failed:", err)
      )
    )

    // Send auto-reply SMS to customer if they provided a phone number
    if (result.phone && isPhoneNumber(result.phone)) {
      smsPromises.push(
        sendContactAutoReplySMS(result.phone, result.name).catch((err) =>
          console.warn("[contact-form] Customer auto-reply SMS failed:", err)
        )
      )
    }

    // Don't block the response on SMS — let them resolve in background
    Promise.allSettled(smsPromises)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[contact-form] Error:", err?.message || err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
