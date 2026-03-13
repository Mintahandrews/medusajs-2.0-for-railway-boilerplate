import { Modules } from "@medusajs/framework/utils"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

/**
 * Auto-Inventory Sync subscriber.
 *
 * When a product is created, this subscriber:
 * 1. Enables `manage_inventory` on all variants
 * 2. Finds (or creates) a default stock location
 * 3. Creates inventory items & levels with `stocked_quantity: 0`
 *    so every product immediately shows up in the admin Inventory page
 *
 * The admin then just needs to update the actual stock quantities.
 */
export default async function productInventorySyncHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    const productId = data.id
    const query = container.resolve("query")

    // Fetch the newly created product with its variants
    const { data: [product] } = await query.graph({
      entity: "product",
      fields: ["id", "title", "variants.*"],
      filters: { id: productId },
    })

    if (!product?.variants?.length) {
      return
    }

    // Get or create a stock location
    const { data: stockLocations } = await query.graph({
      entity: "stock_location",
      fields: ["id", "name"],
    })

    let stockLocationId: string

    if (stockLocations.length > 0) {
      stockLocationId = stockLocations[0].id
    } else {
      // Create a default stock location if none exists
      const stockLocationService = container.resolve(Modules.STOCK_LOCATION)
      const created = await stockLocationService.createStockLocations({
        name: "Default Warehouse",
      })
      stockLocationId = Array.isArray(created) ? created[0].id : created.id
    }

    // Get existing inventory items to avoid duplicates
    const { data: existingInventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: ["id", "sku"],
    })
    const existingSkus = new Set(existingInventoryItems.map((i: any) => i.sku).filter(Boolean))

    const inventoryService = container.resolve(Modules.INVENTORY)
    const productService = container.resolve(Modules.PRODUCT)

    for (const variant of product.variants) {
      // Enable manage_inventory if not already set
      if (!variant.manage_inventory) {
        try {
          await productService.updateProductVariants(variant.id, {
            manage_inventory: true,
          })
        } catch (e) {
          console.warn(`[product-inventory-sync] Could not enable manage_inventory for variant ${variant.id}:`, e)
        }
      }

      // Create an inventory item for this variant if none exists
      const sku = variant.sku || `${product.title}-${variant.title}`.replace(/\s+/g, "-").toLowerCase()

      if (existingSkus.has(sku)) {
        continue // Already has an inventory item
      }

      try {
        const inventoryItem = await inventoryService.createInventoryItems({
          sku,
          title: `${product.title} — ${variant.title}`,
          requires_shipping: true,
        })

        const itemId = Array.isArray(inventoryItem)
          ? inventoryItem[0].id
          : inventoryItem.id

        // Create an inventory level at the stock location with 0 quantity
        await inventoryService.createInventoryLevels({
          inventory_item_id: itemId,
          location_id: stockLocationId,
          stocked_quantity: 0,
        })

        console.log(
          `[product-inventory-sync] Created inventory for "${product.title} — ${variant.title}" (SKU: ${sku})`
        )
      } catch (e) {
        console.warn(`[product-inventory-sync] Could not create inventory for variant ${variant.id}:`, e)
      }
    }
  } catch (error) {
    console.error("[product-inventory-sync] Error:", error)
  }
}

export const config: SubscriberConfig = {
  event: "product.created",
}
