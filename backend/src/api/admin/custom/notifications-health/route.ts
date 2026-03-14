import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { Modules } from '@medusajs/framework/utils'

/**
 * GET /admin/custom/notifications-health
 * Diagnostic endpoint — checks whether the notification module and its
 * providers (email / SMS) are loaded and reachable.
 */
export async function GET(_req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const checks: Record<string, any> = {}

  // 1. Check notification module is resolvable
  try {
    const notificationService = _req.scope.resolve(Modules.NOTIFICATION)
    checks.notification_module = notificationService ? 'loaded' : 'missing'
  } catch (err: any) {
    checks.notification_module = `error: ${err.message}`
  }

  // 2. Check event bus
  try {
    const eventBus = _req.scope.resolve(Modules.EVENT_BUS)
    checks.event_bus = eventBus ? 'loaded' : 'missing'
  } catch (err: any) {
    checks.event_bus = `error: ${err.message}`
  }

  // 3. Check relevant env vars (mask actual values)
  const envChecks: Record<string, boolean> = {
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: !!(process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM),
    SMSONLINEGH_API_KEY: !!process.env.SMSONLINEGH_API_KEY,
    SMSONLINEGH_SENDER_ID: !!(process.env.SMSONLINEGH_SENDER_ID),
    REDIS_URL: !!process.env.REDIS_URL,
    STOREFRONT_URL: !!process.env.STOREFRONT_URL,
    SUPPORT_EMAIL: !!process.env.SUPPORT_EMAIL,
    MEDUSA_WORKER_MODE: !!process.env.MEDUSA_WORKER_MODE,
  }
  checks.env_vars = envChecks

  // 4. Show effective worker mode
  checks.worker_mode = process.env.MEDUSA_WORKER_MODE ?? 'shared (default)'

  // 5. Try a dry-run notification list to confirm the module is functional
  try {
    const notificationService: any = _req.scope.resolve(Modules.NOTIFICATION)
    const recent = await notificationService.listNotifications({}, { take: 3, order: { created_at: 'DESC' } })
    checks.recent_notifications = recent.map((n: any) => ({
      id: n.id,
      channel: n.channel,
      to: n.to,
      template: n.template,
      status: n.status,
      created_at: n.created_at,
      provider_id: n.provider_id,
    }))
  } catch (err: any) {
    checks.recent_notifications = `error: ${err.message}`
  }

  res.json(checks)
}
