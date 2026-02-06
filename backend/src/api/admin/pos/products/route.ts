import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { POS_MODULE } from "../../../../modules/pos"
import PosModuleService from "../../../../modules/pos/service"
import { validatePosRequest } from "../../../../modules/pos/middleware"
import type { SyncStatus, CreateProductMappingInput } from "../../../../modules/pos/types"

/**
 * GET /admin/pos/products
 * List product mappings, optionally filtered by sync_status
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const posService: PosModuleService = req.scope.resolve(POS_MODULE)
  const authError = validatePosRequest(req, posService)
  if (authError) { res.status(authError.status).json({ message: authError.message }); return }
  const sync_status = req.query.sync_status as SyncStatus | undefined
  const mappings = await posService.listProductMappings(
    sync_status ? { sync_status } : undefined
  )
  res.json({ product_mappings: mappings })
}

/**
 * POST /admin/pos/products
 * Create a new product mapping between Medusa and POS
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const posService: PosModuleService = req.scope.resolve(POS_MODULE)
  const authError = validatePosRequest(req, posService)
  if (authError) { res.status(authError.status).json({ message: authError.message }); return }
  const body = req.body as CreateProductMappingInput

  if (!body.medusa_product_id || !body.medusa_variant_id) {
    res
      .status(400)
      .json({ message: "medusa_product_id and medusa_variant_id are required" })
    return
  }

  const mapping = await posService.createProductMapping(body)
  res.status(201).json({ product_mapping: mapping })
}
