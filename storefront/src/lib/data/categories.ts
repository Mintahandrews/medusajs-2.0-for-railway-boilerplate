import { sdk } from "@lib/config"
import { cache } from "react"

export const listCategories = cache(async function () {
  return sdk.store.category
    .list({ fields: "+category_children" }, { next: { tags: ["categories"] } })
    .then(({ product_categories }) => product_categories)
})

export const getCategoriesList = cache(async function (
  offset: number = 0,
  limit: number = 100
) {
  return sdk.store.category.list(
    // TODO: Look into fixing the type
    // @ts-ignore
    { limit, offset },
    { next: { tags: ["categories"] } }
  )
})

export const getCategoryByHandle = cache(async function (
  categoryHandle: string[]
) {
  return sdk.store.category.list(
    // Pass a single string when only one handle segment to avoid array
    // serialisation issues with some Medusa SDK versions.
    {
      handle:
        categoryHandle.length === 1
          ? categoryHandle[0]
          : (categoryHandle as any),
    },
    { next: { tags: ["categories"] } }
  )
})
