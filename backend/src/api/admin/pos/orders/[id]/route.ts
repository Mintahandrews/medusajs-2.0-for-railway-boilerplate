import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { POS_MODULE } from "../../../../../modules/pos"
import PosModuleService from "../../../../../modules/pos/service"

/**
 * PATCH /admin/pos/orders/:id
 * Update an order sync record (e.g. mark as synced by the POS agent)
 */
export async function PATCH(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const posService: PosModuleService = req.scope.resolve(POS_MODULE)
  const { id } = req.params
  const body = req.body as Record<string, any>

  const updated = await posService.updateOrderSync(id, {
    pos_order_id: body.pos_order_id,
    sync_status: body.sync_status,
    error_message: body.error_message,
  })

  if (!updated) {
    res.status(404).json({ message: "Order sync record not found" })
    return
  }

  res.json({ order_sync: updated })
}
