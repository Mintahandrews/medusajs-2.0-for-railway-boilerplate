"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"
import { getOrSetCart } from "./cart"
import { revalidateTag } from "next/cache"

/**
 * Find a "Custom Case" product in the Medusa store.
 * Searches by title containing "custom case" (case-insensitive).
 */
export async function findCustomCaseProduct() {
  try {
    const { products } = await sdk.store.product.list(
      { q: "custom case", limit: 5 },
      { next: { tags: ["products"] } }
    )

    // Find product whose title matches custom case
    const match = products.find((p) => {
      const t = (p.title || "").toLowerCase()
      return t.includes("custom") && t.includes("case")
    })

    if (!match || !match.variants?.length) return null

    return {
      productId: match.id,
      variantId: match.variants[0].id,
      title: match.title,
    }
  } catch {
    return null
  }
}

/**
 * Add a custom-designed case to the Medusa cart.
 * Stores the design image, device info, and canvas JSON as line item metadata.
 */
export async function addCustomCaseToCart({
  countryCode,
  designImage,
  deviceName,
  canvasJSON,
}: {
  countryCode: string
  designImage: string
  deviceName: string
  canvasJSON?: string | null
}) {
  // 1. Find the custom case product
  const caseProduct = await findCustomCaseProduct()

  if (!caseProduct) {
    return {
      success: false,
      error:
        "No 'Custom Case' product found in the store. Please ask the admin to create a product named 'Custom Case' with at least one variant.",
    }
  }

  // 2. Get or create cart
  const cart = await getOrSetCart(countryCode)
  if (!cart) {
    return { success: false, error: "Could not create or retrieve cart." }
  }

  // 3. Add line item with metadata
  try {
    await sdk.store.cart.createLineItem(
      cart.id,
      {
        variant_id: caseProduct.variantId,
        quantity: 1,
        metadata: {
          custom_design: true,
          design_image: designImage.slice(0, 500000), // cap at ~500KB base64
          device_name: deviceName,
          canvas_json: canvasJSON?.slice(0, 500000) || null,
          designed_at: new Date().toISOString(),
        },
      },
      {},
      await getAuthHeaders()
    )

    revalidateTag("cart")
    return { success: true, error: null }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to add custom case to cart.",
    }
  }
}
