import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

/**
 * POST /store/custom/design-cleanup
 *
 * Deletes uploaded design files (preview + print) from the file provider
 * (MinIO) when a customized line item is removed from cart.
 *
 * Body: { file_keys: string[] }
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { file_keys } = req.body as { file_keys: string[] }

    if (!file_keys || !Array.isArray(file_keys) || file_keys.length === 0) {
      res.status(400).json({ message: "file_keys array is required" })
      return
    }

    // Limit to 10 keys per request to prevent abuse
    if (file_keys.length > 10) {
      res.status(400).json({ message: "Maximum 10 file keys per request" })
      return
    }

    const fileModuleService = req.scope.resolve(Modules.FILE) as any

    const results: Array<{ key: string; deleted: boolean; error?: string }> = []

    for (const key of file_keys) {
      if (!key || typeof key !== "string") continue
      try {
        await fileModuleService.deleteFiles(key)
        results.push({ key, deleted: true })
      } catch (err: any) {
        console.warn(`[design-cleanup] Failed to delete file ${key}:`, err.message)
        results.push({ key, deleted: false, error: err.message })
      }
    }

    console.log("[design-cleanup] Cleaned up files:", results.filter(r => r.deleted).length, "of", file_keys.length)
    res.json({ success: true, results })
  } catch (error: any) {
    console.error("[design-cleanup] Error:", error)
    res.status(500).json({ message: error.message || "Cleanup failed" })
  }
}
