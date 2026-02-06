import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { POS_MODULE } from "../../../modules/pos"
import PosModuleService from "../../../modules/pos/service"
import { validatePosRequest } from "../../../modules/pos/middleware"

/**
 * GET /admin/pos
 * Returns POS sync stats dashboard data
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const posService: PosModuleService = req.scope.resolve(POS_MODULE)

  const authError = validatePosRequest(req, posService)
  if (authError) {
    res.status(authError.status).json({ message: authError.message })
    return
  }

  const stats = await posService.getStats()
  res.json({ stats })
}
