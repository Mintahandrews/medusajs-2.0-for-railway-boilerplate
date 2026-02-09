import { defineMiddlewares } from "@medusajs/framework/http"

/**
 * Custom middleware configuration.
 * Increases the JSON body size limit for routes that receive large base64 payloads.
 * Uses numeric bytes to ensure compatibility across Medusa versions.
 */
export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/custom/ai-preview",
      method: ["POST"],
      bodyParser: { sizeLimit: 10 * 1024 * 1024 },
    },
    {
      matcher: "/store/custom/design-upload",
      method: ["POST"],
      bodyParser: { sizeLimit: 10 * 1024 * 1024 },
    },
  ],
})
