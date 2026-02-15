import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"
import { getRegion } from "./regions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { sortProducts } from "@lib/util/sort-products"
import { getProductPrice } from "@lib/util/get-product-price"

export const getProductsById = cache(async function ({
  ids,
  regionId,
}: {
  ids: string[]
  regionId: string
}) {
  return sdk.store.product
    .list(
      {
        id: ids,
        region_id: regionId,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder",
      },
      { next: { tags: ["products"] } }
    )
    .then(({ products }) => products)
})

export const getProductByHandle = cache(async function (
  handle: string,
  regionId: string
) {
  return sdk.store.product
    .list(
      {
        handle,
        region_id: regionId,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder",
      },
      { next: { tags: ["products"] } }
    )
    .then(({ products }) => products[0])
})

export const searchProducts = cache(async function (
  query: string,
  regionId: string,
  limit = 20
) {
  return sdk.store.product
    .list(
      {
        q: query,
        region_id: regionId,
        limit,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder",
      },
      { next: { tags: ["products"] } }
    )
    .then(({ products }) => products)
})

export const getProductsList = cache(async function ({
  pageParam = 1,
  queryParams,
  countryCode,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> {
  const limit = queryParams?.limit || 12
  const validPageParam = Math.max(pageParam, 1);
  const offset = (validPageParam - 1) * limit
  const region = await getRegion(countryCode)

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }
  return sdk.store.product
    .list(
      {
        limit,
        offset,
        region_id: region.id,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder",
        ...queryParams,
      },
      { next: { tags: ["products"] } }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
})

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const getProductsListWithSort = cache(async function ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  onlyDiscounted,
  defaultDiscountSort,
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  onlyDiscounted?: boolean
  defaultDiscountSort?: boolean
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> {
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await getProductsList({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const discountedProducts = onlyDiscounted
    ? sortedProducts.filter((product) => {
        try {
          const { cheapestPrice } = getProductPrice({ product })
          if (!cheapestPrice) {
            return false
          }

          return (
            cheapestPrice.price_type === "sale" ||
            cheapestPrice.original_price_number > cheapestPrice.calculated_price_number
          )
        } catch {
          return false
        }
      })
    : sortedProducts

  const discountSortedProducts =
    onlyDiscounted && defaultDiscountSort
      ? discountedProducts
          .map((product) => {
            try {
              const { cheapestPrice } = getProductPrice({ product })
              const discount = cheapestPrice
                ? Number(cheapestPrice.percentage_diff) || 0
                : 0
              const createdAt = product.created_at
                ? new Date(product.created_at).getTime()
                : 0
              return { product, discount, createdAt }
            } catch {
              const createdAt = product.created_at
                ? new Date(product.created_at).getTime()
                : 0
              return { product, discount: 0, createdAt }
            }
          })
          .sort((a, b) => {
            if (b.discount !== a.discount) {
              return b.discount - a.discount
            }
            return b.createdAt - a.createdAt
          })
          .map((x) => x.product)
      : discountedProducts

  const pageParam = (page - 1) * limit

  const effectiveCount = onlyDiscounted ? discountSortedProducts.length : count

  const nextPage = effectiveCount > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = discountSortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count: effectiveCount,
    },
    nextPage,
    queryParams,
  }
})
