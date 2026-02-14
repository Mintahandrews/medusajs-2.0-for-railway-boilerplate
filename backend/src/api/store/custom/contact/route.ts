import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { INotificationModuleService } from "@medusajs/framework/types"
import { EmailTemplates } from "modules/email-notifications/templates"
import { SUPPORT_EMAIL } from "lib/constants"

/**
 * POST /store/custom/contact
 *
 * Public endpoint – no auth required.
 * Accepts { name, email, phone?, subject, message } and forwards it
 * to the support inbox via Medusa's notification module (Resend / SendGrid).
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { name, email, phone, subject, message } = req.body as {
    name?: string
    email?: string
    phone?: string
    subject?: string
    message?: string
  }

  // ---------- validation ----------
  if (!name?.trim()) {
    res.status(400).json({ error: "Name is required." })
    return
  }
  if (!email?.trim() || !email.includes("@")) {
    res.status(400).json({ error: "A valid email address is required." })
    return
  }
  if (!message?.trim()) {
    res.status(400).json({ error: "Message is required." })
    return
  }

  const trimmed = {
    name: name.trim(),
    email: email.trim(),
    phone: phone?.trim() || undefined,
    subject: subject?.trim() || "General",
    message: message.trim(),
    timestamp: new Date().toISOString(),
  }

  // Resolve the support/recipient address
  const supportAddress = SUPPORT_EMAIL || "support@letscase.com"

  try {
    const notificationService: INotificationModuleService =
      req.scope.resolve(Modules.NOTIFICATION)

    // Send email to the support inbox
    await notificationService.createNotifications({
      to: supportAddress,
      channel: "email",
      template: EmailTemplates.CONTACT_FORM,
      data: {
        emailOptions: {
          replyTo: trimmed.email,
          subject: `[Contact] ${trimmed.subject} — from ${trimmed.name}`,
        },
        ...trimmed,
      },
    })

    res.json({ success: true })
  } catch (error: any) {
    req.scope.resolve("logger")?.error?.(
      `[contact-form] Notification send failed: ${error?.message || error}`
    )
    // Return a generic error — don't expose internal details
    res.status(500).json({
      error: "We couldn't send your message right now. Please try again or reach us on WhatsApp.",
    })
  }
}
