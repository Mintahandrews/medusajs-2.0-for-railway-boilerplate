import { defineMiddlewares } from "@medusajs/framework/http"

/**
 * Custom middleware configuration.
 * Increases the JSON body size limit for routes that receive large base64 payloads.
 * Uses string format (e.g. "10mb") for Medusa middleware compatibility.
 */
export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/custom/ai-preview",
      method: ["POST"],
      bodyParser: { sizeLimit: "10mb" },
    },
    {
      matcher: "/store/custom/design-upload",
      method: ["POST"],
      bodyParser: { sizeLimit: "10mb" },
    },
  ],
})
