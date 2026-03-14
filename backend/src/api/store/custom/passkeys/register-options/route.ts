import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { Modules } from '@medusajs/framework/utils'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { WEBAUTHN_RP_NAME, WEBAUTHN_RP_ID } from 'lib/constants'
import { PASSKEY_MODULE } from 'modules/passkey'
import { setChallenge } from 'lib/challenge-store'
import crypto from 'crypto'

/**
 * POST /store/custom/passkeys/register-options
 * Authenticated — customer must be logged in.
 * Returns registration options for the browser's WebAuthn API.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
    const customerId = (req as any).auth_context?.actor_id
    if (!customerId) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    const customerService = req.scope.resolve(Modules.CUSTOMER) as any
    const customer = await customerService.retrieveCustomer(customerId)
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' })
      return
    }

    const passkeyService = req.scope.resolve(PASSKEY_MODULE) as any

    // Get existing credentials to exclude them from registration
    const existing = await passkeyService.listPasskeyCredentials({
      customer_id: customerId,
    })

    const excludeCredentials = existing.map((cred: any) => ({
      id: cred.credential_id,
      transports: JSON.parse(cred.transports || '[]'),
    }))

    // Generate a stable webauthn user ID for this customer
    const webauthnUserIdBuf = crypto
      .createHash('sha256')
      .update(customerId)
      .digest()
    const webauthnUserId = new Uint8Array(webauthnUserIdBuf)

    const options = await generateRegistrationOptions({
      rpName: WEBAUTHN_RP_NAME,
      rpID: WEBAUTHN_RP_ID,
      userName: customer.email || customer.phone || customerId,
      userDisplayName:
        [customer.first_name, customer.last_name].filter(Boolean).join(' ') ||
        customer.email ||
        'Lets Case Customer',
      userID: webauthnUserId,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
    })

    // Store the challenge for verification
    const challengeId = crypto.randomUUID()
    setChallenge(challengeId, options.challenge)

    res.json({ options, challengeId })
  } catch (error: any) {
    console.error('[passkey/register-options]', error)
    res.status(500).json({ error: 'Failed to generate registration options' })
  }
}
