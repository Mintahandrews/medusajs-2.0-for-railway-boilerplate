import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { WEBAUTHN_RP_ID } from 'lib/constants'
import { setChallenge } from 'lib/challenge-store'
import crypto from 'crypto'

/**
 * POST /store/custom/passkeys/login-options
 * Public — no auth required.
 * Returns authentication options for discoverable credentials (passkeys).
 */
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
    const options = await generateAuthenticationOptions({
      rpID: WEBAUTHN_RP_ID,
      userVerification: 'preferred',
      // Empty allowCredentials = discoverable credentials (passkeys)
    })

    const challengeId = crypto.randomUUID()
    setChallenge(challengeId, options.challenge)

    res.json({ options, challengeId })
  } catch (error: any) {
    console.error('[passkey/login-options]', error)
    res.status(500).json({ error: 'Failed to generate authentication options' })
  }
}
