import { HttpTypes } from "@medusajs/types"
import { getBaseURL } from "@lib/util/env"

type Props = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default function ProductJsonLd({ product, countryCode }: Props) {
  const baseUrl = getBaseURL()
  const url = `${baseUrl}/${countryCode}/products/${product.handle}`

  // Get price range from variants
  const prices = product.variants
    ?.flatMap((v) => v.calculated_price ? [v.calculated_price] : [])
    .filter(Boolean) || []

  const amounts = prices
    .map((p: any) => p.calculated_amount ?? p.original_amount)
    .filter((a): a is number => typeof a === "number" && a > 0)

  const currencyCode = (prices[0] as any)?.currency_code || "GHS"
  const lowPrice = amounts.length ? Math.min(...amounts) / 100 : undefined
  const highPrice = amounts.length ? Math.max(...amounts) / 100 : undefined

  // Collect all images
  const images = [
    product.thumbnail,
    ...(product.images?.map((i) => i.url) || []),
  ].filter(Boolean)

  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || product.subtitle || product.title,
    url,
    image: images,
    brand: {
      "@type": "Brand",
      name: "Letscase",
    },
    sku: product.variants?.[0]?.sku || product.id,
    category: (product as any).collection?.title || "Phone Cases & Accessories",
  }

  if (lowPrice !== undefined) {
    jsonLd.offers = {
      "@type": highPrice && highPrice !== lowPrice ? "AggregateOffer" : "Offer",
      priceCurrency: currencyCode.toUpperCase(),
      availability: "https://schema.org/InStock",
      url,
      ...(highPrice && highPrice !== lowPrice
        ? { lowPrice: lowPrice.toFixed(2), highPrice: highPrice.toFixed(2) }
        : { price: lowPrice.toFixed(2) }),
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
