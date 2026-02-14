import { NextRequest, NextResponse } from "next/server"

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const SUPPORT_EMAIL =
  (process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "").trim() || "support@letscase.com"

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
  if (!email?.trim() || !email.includes("@")) return "A valid email address is required."
  if (!message?.trim()) return "Message is required."

  return {
    name: name.trim(),
    email: email.trim(),
    phone: phone?.trim() || undefined,
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

/** Minimal HTML email for the direct-Resend fallback. */
function buildHtml(p: ContactPayload): string {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
      <h2 style="margin-bottom:4px">New Contact Form Submission</h2>
      <p style="color:#666;font-size:14px">A customer reached out via the contact form.</p>
      <hr style="border:none;border-top:1px solid #eaeaea;margin:16px 0"/>
      <p style="font-size:13px;color:#999;margin:0;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">From</p>
      <p style="font-size:15px;margin:4px 0 12px">${esc(p.name)} &lt;${esc(p.email)}&gt;</p>
      ${p.phone ? `<p style="font-size:13px;color:#999;margin:0;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Phone</p><p style="font-size:15px;margin:4px 0 12px">${esc(p.phone)}</p>` : ""}
      <p style="font-size:13px;color:#999;margin:0;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Subject</p>
      <p style="font-size:15px;margin:4px 0 12px">${esc(p.subject)}</p>
      <hr style="border:none;border-top:1px solid #eaeaea;margin:16px 0"/>
      <p style="font-size:13px;color:#999;margin:0;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Message</p>
      <p style="font-size:15px;white-space:pre-wrap;line-height:1.6;margin:4px 0 16px">${esc(p.message)}</p>
      <hr style="border:none;border-top:1px solid #eaeaea;margin:16px 0"/>
      <p style="font-size:12px;color:#999">Reply directly to this email to respond to the customer.</p>
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
        // We still return success to the user — the message is logged and
        // the team can retrieve it from server logs.
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[contact-form] Error:", err?.message || err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
