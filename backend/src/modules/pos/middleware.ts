import type { MedusaRequest } from "@medusajs/framework"
import type PosModuleService from "./service"

type PosAuthError = { status: number; message: string }

/**
 * Validates a POS API request:
 *  1. Checks the module is enabled
 *  2. If an API key is configured, validates the x-pos-api-key header
 *
 * Admin-session requests (from the dashboard) skip the API key check
 * because they are already authenticated via Medusa admin auth.
 */
export function validatePosRequest(
  req: MedusaRequest,
  posService: PosModuleService
): PosAuthError | null {
  if (!posService.isEnabled()) {
    return { status: 503, message: "POS module is not enabled" }
  }

  // Admin dashboard requests carry a session cookie — skip API key check
  if ((req as any).auth_context?.actor_id) {
    return null
  }

  // External agent requests must provide the API key header
  const apiKey = req.headers["x-pos-api-key"] as string | undefined
  if (apiKey && !posService.validateApiKey(apiKey)) {
    return { status: 401, message: "Invalid POS API key" }
  }

  return null
}
