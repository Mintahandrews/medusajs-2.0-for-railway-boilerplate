import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

/**
 * POST /store/custom/line-item-metadata
 *
 * Updates a cart line item's metadata. This is needed because the standard
 * Store API's createLineItem endpoint does NOT support metadata.
 *
 * Body: { cart_id: string, line_item_id: string, metadata: Record<string, string> }
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { cart_id, line_item_id, metadata } = req.body as {
      cart_id: string
      line_item_id: string
      metadata: Record<string, string>
    }

    if (!cart_id || !line_item_id || !metadata) {
      res.status(400).json({
        message: "cart_id, line_item_id, and metadata are required",
      })
      return
    }

    // Resolve the Cart Module service
    const cartModuleService = req.scope.resolve(Modules.CART) as any

    // Verify the cart exists and the line item belongs to it
    const cart = await cartModuleService.retrieveCart(cart_id, {
      relations: ["items"],
    })

    if (!cart) {
      res.status(404).json({ message: "Cart not found" })
      return
    }

    const lineItem = cart.items?.find((item: any) => item.id === line_item_id)
    if (!lineItem) {
      res.status(404).json({ message: "Line item not found in this cart" })
      return
    }

    // Update the line item metadata using the Cart Module service
    await cartModuleService.updateLineItems(line_item_id, {
      metadata: {
        ...(lineItem.metadata || {}),
        ...metadata,
      },
    })

    res.json({ success: true })
  } catch (error: any) {
    console.error("[line-item-metadata] Update failed:", error)
    res.status(500).json({
      message: error.message || "Failed to update line item metadata",
    })
  }
}
