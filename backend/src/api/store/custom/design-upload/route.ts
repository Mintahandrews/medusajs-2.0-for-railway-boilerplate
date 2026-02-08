import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { ulid } from "ulid"

/**
 * POST /store/custom/design-upload
 *
 * Accepts base64-encoded PNG images (preview + print file) from the
 * phone-case customizer and uploads them to the configured file provider
 * (MinIO on Railway).
 *
 * Body: { files: [{ name: string, content: string (base64), mimeType: string }] }
 * Returns: { uploads: [{ url: string, key: string }] }
 */
const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
])

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { files, cart_id } = req.body as {
      files: Array<{ name: string; content: string; mimeType: string }>
      cart_id?: string
    }

    // Require a cart_id to prevent anonymous abuse
    if (!cart_id) {
      res.status(401).json({ message: "A cart_id is required to upload design files" })
      return
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      res.status(400).json({ message: "No files provided" })
      return
    }

    // Limit to 2 files (preview + print) and 5 MB each (base64)
    if (files.length > 2) {
      res.status(400).json({ message: "Maximum 2 files allowed" })
      return
    }

    const MAX_BASE64_SIZE = 5 * 1024 * 1024 * 1.37 // ~5 MB as base64
    for (const f of files) {
      if (!f.name || !f.content || !f.mimeType) {
        res.status(400).json({ message: "Each file must have name, content, and mimeType" })
        return
      }
      if (!ALLOWED_MIME_TYPES.has(f.mimeType)) {
        res.status(400).json({ message: `Unsupported file type: ${f.mimeType}. Only image files are allowed.` })
        return
      }
      if (f.content.length > MAX_BASE64_SIZE) {
        res.status(400).json({ message: `File ${f.name} exceeds 5 MB limit` })
        return
      }
    }

    const fileModuleService = req.scope.resolve(Modules.FILE) as any

    const uploads: Array<{ url: string; key: string }> = []

    for (const f of files) {
      // Generate a unique filename with the original extension
      const ext = f.name.split(".").pop() || "png"
      const uniqueName = `customizer/${ulid()}.${ext}`

      const result = await fileModuleService.createFiles({
        filename: uniqueName,
        mimeType: f.mimeType,
        content: f.content,
      })

      // createFiles can return a single object or an array
      const file = Array.isArray(result) ? result[0] : result
      uploads.push({ url: file.url, key: file.key })
    }

    res.json({ uploads })
  } catch (error: any) {
    console.error("[design-upload] Upload failed:", error)
    res.status(500).json({ message: error.message || "Upload failed" })
  }
}
