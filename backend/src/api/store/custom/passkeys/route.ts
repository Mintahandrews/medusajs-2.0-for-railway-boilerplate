import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { PASSKEY_MODULE } from 'modules/passkey'

/**
 * GET /store/custom/passkeys
 * Authenticated — returns the customer's registered passkeys.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
    const customerId = (req as any).auth_context?.actor_id
    if (!customerId) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    const passkeyService = req.scope.resolve(PASSKEY_MODULE) as any
    const credentials = await passkeyService.listPasskeyCredentials({
      customer_id: customerId,
    })

    res.json({
      passkeys: credentials.map((cred: any) => ({
        id: cred.id,
        device_name: cred.device_name,
        created_at: cred.created_at,
      })),
    })
  } catch (error: any) {
    console.error('[passkey/list]', error)
    res.status(500).json({ error: 'Failed to list passkeys' })
  }
}

/**
 * DELETE /store/custom/passkeys
 * Authenticated — removes a passkey by id (passed in body).
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
    const customerId = (req as any).auth_context?.actor_id
    if (!customerId) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    const { id } = req.body as { id: string }
    if (!id) {
      res.status(400).json({ error: 'Passkey id is required' })
      return
    }

    const passkeyService = req.scope.resolve(PASSKEY_MODULE) as any

    // Verify ownership before deleting
    const [credential] = await passkeyService.listPasskeyCredentials({ id })
    if (!credential || credential.customer_id !== customerId) {
      res.status(404).json({ error: 'Passkey not found' })
      return
    }

    await passkeyService.deletePasskeyCredentials(id)
    res.json({ success: true })
  } catch (error: any) {
    console.error('[passkey/delete]', error)
    res.status(500).json({ error: 'Failed to delete passkey' })
  }
}
