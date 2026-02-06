import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { POS_MODULE } from "../../../../modules/pos"
import PosModuleService from "../../../../modules/pos/service"
import type { SyncStatus, CreateInventorySyncInput } from "../../../../modules/pos/types"

/**
 * GET /admin/pos/inventory
 * List inventory sync records
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const posService: PosModuleService = req.scope.resolve(POS_MODULE)
  const sync_status = req.query.sync_status as SyncStatus | undefined
  const syncs = await posService.listInventorySyncs(
    sync_status ? { sync_status } : undefined
  )
  res.json({ inventory_syncs: syncs })
}

/**
 * POST /admin/pos/inventory
 * Create or update an inventory sync record
 * Called by the POS sync agent to report inventory levels
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const posService: PosModuleService = req.scope.resolve(POS_MODULE)
  const body = req.body as CreateInventorySyncInput

  if (!body.medusa_variant_id || !body.pos_product_id) {
    res
      .status(400)
      .json({ message: "medusa_variant_id and pos_product_id are required" })
    return
  }

  const sync = await posService.createInventorySync(body)
  res.status(201).json({ inventory_sync: sync })
}
