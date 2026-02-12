import type { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"
import { getProductsList } from "@lib/data/products"
import { getCollectionsList } from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseURL()

  // Get all country codes from regions
  let countryCodes: string[] = ["gh"]
  try {
    const regions = await listRegions()
    const codes = regions
      ?.flatMap((r) => r.countries?.map((c) => c.iso_2))
      .filter(Boolean) as string[]
    if (codes?.length) countryCodes = codes
  } catch {}

  const defaultCountry = countryCodes[0] || "gh"

  // Static pages
  const staticPages = [
    "",
    "/store",
    "/about-us",
    "/our-story",
    "/contact",
    "/faq",
    "/privacy-policy",
    "/returns-and-refunds",
    "/customer-service",
    "/best-sellers",
    "/new-arrivals",
    "/deals",
  ]

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${baseUrl}/${defaultCountry}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1.0 : 0.7,
  }))

  // Product pages
  let productEntries: MetadataRoute.Sitemap = []
  try {
    const { response } = await getProductsList({
      countryCode: defaultCountry,
      queryParams: { limit: 500 },
    })
    productEntries = (response.products || [])
      .filter((p) => p.handle)
      .map((product) => ({
        url: `${baseUrl}/${defaultCountry}/products/${product.handle}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }))
  } catch {}

  // Collection pages
  let collectionEntries: MetadataRoute.Sitemap = []
  try {
    const { collections } = await getCollectionsList()
    collectionEntries = (collections || [])
      .filter((c) => c.handle)
      .map((collection) => ({
        url: `${baseUrl}/${defaultCountry}/collections/${collection.handle}`,
        lastModified: collection.updated_at ? new Date(collection.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
  } catch {}

  // Category pages
  let categoryEntries: MetadataRoute.Sitemap = []
  try {
    const categories = await listCategories()
    categoryEntries = (categories || [])
      .filter((c) => c.handle)
      .map((category) => ({
        url: `${baseUrl}/${defaultCountry}/categories/${category.handle}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }))
  } catch {}

  return [
    ...staticEntries,
    ...productEntries,
    ...collectionEntries,
    ...categoryEntries,
  ]
}
