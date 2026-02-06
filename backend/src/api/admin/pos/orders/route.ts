import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { POS_MODULE } from "../../../../modules/pos"
import PosModuleService from "../../../../modules/pos/service"
import type { SyncStatus, CreateOrderSyncInput } from "../../../../modules/pos/types"

/**
 * GET /admin/pos/orders
 * List order sync records, optionally filtered by sync_status
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const posService: PosModuleService = req.scope.resolve(POS_MODULE)
  const sync_status = req.query.sync_status as SyncStatus | undefined
  const syncs = await posService.listOrderSyncs(
    sync_status ? { sync_status } : undefined
  )
  res.json({ order_syncs: syncs })
}

/**
 * POST /admin/pos/orders
 * Create a new order sync record (queue order for POS push)
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const posService: PosModuleService = req.scope.resolve(POS_MODULE)
  const body = req.body as CreateOrderSyncInput

  if (!body.medusa_order_id) {
    res.status(400).json({ message: "medusa_order_id is required" })
    return
  }

  const existing = await posService.getOrderSyncByOrderId(body.medusa_order_id)
  if (existing) {
    res.json({ order_sync: existing, message: "Order sync already exists" })
    return
  }

  const sync = await posService.createOrderSync(body)
  res.status(201).json({ order_sync: sync })
}
