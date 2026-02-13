import { Modules } from "@medusajs/framework/utils"
import { IOrderModuleService } from "@medusajs/framework/types"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

/**
 * Subscriber: Clean up uploaded design files (MinIO) when orders are
 * cancelled or fulfilled (shipped + delivered means print files are no
 * longer needed on cloud storage).
 *
 * Listens to: order.cancelled, order.completed
 *
 * For each line item with `is_customized === "true"` metadata, it deletes
 * the preview_key and print_file_key from the file provider.
 */
export default async function designFileCleanupHandler({
  event: { data, name },
  container,
}: SubscriberArgs<any>) {
  try {
    const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
    const fileModuleService = container.resolve(Modules.FILE) as any

    const order = await orderModuleService.retrieveOrder(data.id, {
      relations: ["items"],
    })

    if (!order?.items?.length) return

    const keysToDelete: string[] = []

    for (const item of order.items) {
      const meta = (item as any).metadata
      if (!meta || meta.is_customized !== "true") continue

      if (meta.preview_key) keysToDelete.push(meta.preview_key)
      if (meta.print_file_key) keysToDelete.push(meta.print_file_key)
    }

    if (keysToDelete.length === 0) return

    let deleted = 0
    for (const key of keysToDelete) {
      try {
        await fileModuleService.deleteFiles([key])
        deleted++
      } catch (err: any) {
        console.warn(`[design-cleanup] Failed to delete ${key}:`, err.message)
      }
    }

    // Emit a lightweight debug log — safe for production
    if (deleted > 0) {
      console.debug(
        `[design-cleanup] Order ${order.id} (${name}): deleted ${deleted}/${keysToDelete.length} design files`
      )
    }
  } catch (error: any) {
    console.error("[design-cleanup] Subscriber error:", error.message)
  }
}

export const config: SubscriberConfig = {
  event: ["order.cancelled", "order.completed"],
}
