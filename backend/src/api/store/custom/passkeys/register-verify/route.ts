import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { WEBAUTHN_RP_ID, WEBAUTHN_ORIGIN } from 'lib/constants'
import { PASSKEY_MODULE } from 'modules/passkey'
import { getChallenge } from 'lib/challenge-store'
import crypto from 'crypto'

/**
 * POST /store/custom/passkeys/register-verify
 * Authenticated — verifies the registration response and stores the credential.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
    const customerId = (req as any).auth_context?.actor_id
    if (!customerId) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    const { challengeId, response, deviceName } = req.body as {
      challengeId: string
      response: any
      deviceName?: string
    }

    if (!challengeId || !response) {
      res.status(400).json({ error: 'Missing challengeId or response' })
      return
    }

    const expectedChallenge = getChallenge(challengeId)
    if (!expectedChallenge) {
      res.status(400).json({ error: 'Challenge expired or invalid. Please try again.' })
      return
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: WEBAUTHN_ORIGIN,
      expectedRPID: WEBAUTHN_RP_ID,
    })

    if (!verification.verified || !verification.registrationInfo) {
      res.status(400).json({ error: 'Registration verification failed' })
      return
    }

    const { credential, credentialDeviceType, credentialBackedUp } =
      verification.registrationInfo

    const webauthnUserId = crypto
      .createHash('sha256')
      .update(customerId)
      .digest('base64url')

    const passkeyService = req.scope.resolve(PASSKEY_MODULE) as any
    await passkeyService.createPasskeyCredentials({
      credential_id: credential.id,
      public_key: Buffer.from(credential.publicKey).toString('base64url'),
      counter: credential.counter,
      transports: JSON.stringify(credential.transports || []),
      customer_id: customerId,
      device_name: deviceName || `${credentialDeviceType}${credentialBackedUp ? ' (synced)' : ''}`,
      webauthn_user_id: webauthnUserId,
    })

    res.json({ verified: true })
  } catch (error: any) {
    console.error('[passkey/register-verify]', error)
    res.status(500).json({ error: 'Registration verification failed' })
  }
}
