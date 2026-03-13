import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * GET /store/custom/collection-products?collection_id=xxx&limit=100&offset=0
 *
 * Returns products that belong to a collection via EITHER:
 *   1. The native `collection_id` field, OR
 *   2. The product's `metadata.additional_collections` array containing the ID
 *
 * This enables a single product to appear in multiple collections.
 *
 * Usage in admin:  Set a product's metadata to include:
 *   { "additional_collections": ["col_abc", "col_xyz"] }
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const collectionId = req.query.collection_id as string | undefined
  const limit = Math.min(Number(req.query.limit) || 100, 200)
  const offset = Number(req.query.offset) || 0

  if (!collectionId) {
    res.status(400).json({ message: "collection_id query parameter is required" })
    return
  }

  try {
    const query = req.scope.resolve("query")

    // 1. Fetch products with native collection_id match
    const { data: nativeProducts } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "thumbnail",
        "collection_id",
        "metadata",
        "created_at",
        "variants.*",
        "variants.prices.*",
        "images.*",
      ],
      filters: {
        collection_id: collectionId,
      },
    })

    // 2. Fetch ALL products (we need to scan metadata for additional_collections)
    //    We use a generous limit; for very large catalogs consider a custom DB query.
    const { data: allProducts } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "thumbnail",
        "collection_id",
        "metadata",
        "created_at",
        "variants.*",
        "variants.prices.*",
        "images.*",
      ],
    })

    // 3. Find products whose metadata.additional_collections includes collectionId
    const nativeIds = new Set(nativeProducts.map((p: any) => p.id))
    const metadataProducts = allProducts.filter((p: any) => {
      if (nativeIds.has(p.id)) return false // already included
      const additional = p.metadata?.additional_collections
      if (!Array.isArray(additional)) return false
      return additional.includes(collectionId)
    })

    // 4. Merge & deduplicate
    const merged = [...nativeProducts, ...metadataProducts]

    // 5. Sort by created_at desc (newest first)
    merged.sort((a: any, b: any) => {
      const da = new Date(a.created_at || 0).getTime()
      const db = new Date(b.created_at || 0).getTime()
      return db - da
    })

    // 6. Paginate
    const paginated = merged.slice(offset, offset + limit)

    res.json({
      products: paginated,
      count: merged.length,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error("[collection-products] Error:", error)
    res.status(500).json({ message: error.message || "Internal server error" })
  }
}
