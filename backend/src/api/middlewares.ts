import { defineMiddlewares } from "@medusajs/medusa"
import { json } from "express"

/**
 * Custom middleware configuration.
 * Increases the JSON body size limit for routes that receive large base64 payloads.
 */
export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/custom/ai-preview",
      method: "POST",
      middlewares: [json({ limit: "10mb" })],
    },
    {
      matcher: "/store/custom/design-upload",
      method: "POST",
      middlewares: [json({ limit: "10mb" })],
    },
  ],
})
