import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { POS_MODULE } from "../../../../../modules/pos"
import PosModuleService from "../../../../../modules/pos/service"

/**
 * PATCH /admin/pos/products/:id
 * Update a product mapping (e.g. mark as synced, set POS ID)
 */
export async function PATCH(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const posService: PosModuleService = req.scope.resolve(POS_MODULE)
  const { id } = req.params
  const body = req.body as Record<string, any>

  const updated = await posService.updateProductMapping(id, {
    pos_product_id: body.pos_product_id,
    pos_sku: body.pos_sku,
    sync_status: body.sync_status,
    error_message: body.error_message,
  })

  if (!updated) {
    res.status(404).json({ message: "Product mapping not found" })
    return
  }

  res.json({ product_mapping: updated })
}

/**
 * DELETE /admin/pos/products/:id
 * Remove a product mapping
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const posService: PosModuleService = req.scope.resolve(POS_MODULE)
  const { id } = req.params
  const deleted = await posService.deleteProductMapping(id)

  if (!deleted) {
    res.status(404).json({ message: "Product mapping not found" })
    return
  }

  res.json({ id, deleted: true })
}
