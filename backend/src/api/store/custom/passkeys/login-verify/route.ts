import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { Modules } from '@medusajs/framework/utils'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { WEBAUTHN_RP_ID, WEBAUTHN_ORIGIN, JWT_SECRET } from 'lib/constants'
import { PASSKEY_MODULE } from 'modules/passkey'
import { getChallenge } from 'lib/challenge-store'
import jwt from 'jsonwebtoken'

/**
 * POST /store/custom/passkeys/login-verify
 * Public — verifies the authentication response and returns a JWT token.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
    const { challengeId, response } = req.body as {
      challengeId: string
      response: any
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

    // Look up the credential by ID
    const passkeyService = req.scope.resolve(PASSKEY_MODULE) as any
    const [credential] = await passkeyService.listPasskeyCredentials({
      credential_id: response.id,
    })

    if (!credential) {
      res.status(401).json({ error: 'Passkey not recognized. Please sign in with your password.' })
      return
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: WEBAUTHN_ORIGIN,
      expectedRPID: WEBAUTHN_RP_ID,
      credential: {
        id: credential.credential_id,
        publicKey: new Uint8Array(Buffer.from(credential.public_key, 'base64url')),
        counter: credential.counter,
        transports: JSON.parse(credential.transports || '[]'),
      },
    })

    if (!verification.verified) {
      res.status(401).json({ error: 'Passkey verification failed' })
      return
    }

    // Update the counter for replay protection
    await passkeyService.updatePasskeyCredentials({
      id: credential.id,
      counter: verification.authenticationInfo.newCounter,
    })

    // Look up the auth identity for this customer to generate a proper JWT
    const authModule = req.scope.resolve(Modules.AUTH) as any
    const [authIdentity] = await authModule.listAuthIdentities({
      app_metadata: { customer_id: credential.customer_id },
    })

    if (!authIdentity) {
      res.status(401).json({ error: 'Account not found. Please sign in with your password.' })
      return
    }

    // Generate a Medusa-compatible JWT
    const token = jwt.sign(
      {
        actor_id: credential.customer_id,
        actor_type: 'customer',
        auth_identity_id: authIdentity.id,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token })
  } catch (error: any) {
    console.error('[passkey/login-verify]', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
}
