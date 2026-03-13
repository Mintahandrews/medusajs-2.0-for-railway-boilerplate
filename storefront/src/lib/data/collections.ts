import { sdk } from "@lib/config"
import { cache } from "react"
import { getProductsList } from "./products"
import { HttpTypes } from "@medusajs/types"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export const retrieveCollection = cache(async function (id: string) {
  return sdk.store.collection
    .retrieve(id, {}, { next: { tags: ["collections"] } })
    .then(({ collection }) => collection)
})

export const getCollectionsList = cache(async function (
  offset: number = 0,
  limit: number = 100
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> {
  return sdk.store.collection
    .list({ limit, offset }, { next: { tags: ["collections"] } })
    .then(({ collections }) => ({ collections, count: collections.length }))
})

export const getCollectionByHandle = cache(async function (
  handle: string
): Promise<HttpTypes.StoreCollection> {
  return sdk.store.collection
    .list({ handle }, { next: { tags: ["collections"] } })
    .then(({ collections }) => collections[0])
})

/**
 * Fetches products for a collection using the multi-collection backend route.
 * This returns products assigned via both `collection_id` AND
 * `metadata.additional_collections`, allowing one product to appear
 * in multiple collections.
 *
 * Falls back to the standard SDK collection filter on error.
 */
export const getCollectionProducts = cache(
  async (
    collectionId: string,
    limit = 100,
    offset = 0
  ): Promise<{ products: any[]; count: number }> => {
    try {
      const url = `${BACKEND_URL}/store/custom/collection-products?collection_id=${collectionId}&limit=${limit}&offset=${offset}`
      const res = await fetch(url, { next: { tags: ["products", "collections"] } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    } catch (e) {
      // Fallback: standard collection filter (single collection_id only)
      console.warn("[getCollectionProducts] Custom route failed, falling back:", e)
      const { response } = await getProductsList({
        queryParams: { collection_id: [collectionId], limit } as any,
        countryCode: "gh",
      })
      return { products: response.products, count: response.count }
    }
  }
)

export const getCollectionsWithProducts = cache(
  async (countryCode: string): Promise<HttpTypes.StoreCollection[] | null> => {
    const { collections } = await getCollectionsList(0, 3)

    if (!collections) {
      return null
    }

    const collectionIds = collections
      .map((collection) => collection.id)
      .filter(Boolean) as string[]

    const { response } = await getProductsList({
      queryParams: { collection_id: collectionIds } as any,
      countryCode,
    })

    response.products.forEach((product) => {
      const collection = collections.find(
        (collection) => collection.id === product.collection_id
      )

      if (collection) {
        if (!collection.products) {
          collection.products = []
        }

        collection.products.push(product as any)
      }
    })

    return collections as unknown as HttpTypes.StoreCollection[]
  }
)
