import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { POS_MODULE } from "../../../modules/pos"
import PosModuleService from "../../../modules/pos/service"

/**
 * GET /admin/pos
 * Returns POS sync stats dashboard data
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const posService: PosModuleService = req.scope.resolve(POS_MODULE)

  if (!posService.isEnabled()) {
    res.status(503).json({ message: "POS module is not enabled" })
    return
  }

  const stats = await posService.getStats()
  res.json({ stats })
}
