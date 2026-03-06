import { Metadata } from "next"
import { notFound } from "next/navigation"

import ProductTemplate from "@modules/products/templates"
import ProductJsonLd from "@modules/seo/components/product-jsonld"
import BreadcrumbJsonLd from "@modules/seo/components/breadcrumb-jsonld"
import { getRegion, listRegions } from "@lib/data/regions"
import { getProductByHandle, getProductsList } from "@lib/data/products"
import { getBaseURL } from "@lib/util/env"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then(
      (regions) =>
        regions
          ?.map((r) => r.countries?.map((c) => c.iso_2))
          .flat()
          .filter(Boolean) as string[]
    )

    if (!countryCodes?.length) {
      return []
    }

    const products = await Promise.all(
      countryCodes.map((countryCode) => getProductsList({ countryCode }))
    ).then((responses) =>
      responses.map(({ response }) => response.products).flat()
    )

    return countryCodes
      .map((countryCode) =>
        products
          .map((product) => product.handle)
          .filter(Boolean)
          .map((handle) => ({
            countryCode,
            handle,
          }))
      )
      .flat()
  } catch {
    // Backend not reachable during build (common in CI/local builds).
    // Returning [] disables SSG for this route; pages will render at runtime.
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const fallback = {
    title: "Product",
    description: "Premium phone cases and tech accessories at Letscase Ghana.",
  }

  try {
    const { handle, countryCode } = await params
    const region = await getRegion(countryCode)

    if (!region) {
      return fallback
    }

    const product = await getProductByHandle(handle, region.id)

    if (!product) {
      return fallback
    }

    const baseUrl = getBaseURL()
    const url = `${baseUrl}/${countryCode}/products/${handle}`
    const description =
      product.description?.slice(0, 160) ||
      product.subtitle ||
      `Buy ${product.title} at Letscase Ghana. Premium quality, fast delivery across Accra & nationwide.`

    return {
      title: `${product.title}`,
      description,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: `${product.title} | Letscase`,
        description,
        url,
        type: "website",
        images: product.thumbnail
          ? [{ url: product.thumbnail, alt: product.title || "Product" }]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.title} | Letscase`,
        description,
        images: product.thumbnail ? [product.thumbnail] : [],
      },
    }
  } catch {
    return fallback
  }
}

export default async function ProductPage({ params }: Props) {
  const { countryCode, handle } = await params

  let region: Awaited<ReturnType<typeof getRegion>> | null = null
  let pricedProduct: Awaited<ReturnType<typeof getProductByHandle>> | null = null

  try {
    region = await getRegion(countryCode)
  } catch (e) {
    console.error("[ProductPage] Failed to fetch region:", e)
  }

  if (!region) {
    notFound()
  }

  try {
    pricedProduct = await getProductByHandle(handle, region.id)
  } catch (e) {
    console.error("[ProductPage] Failed to fetch product:", handle, e)
  }

  if (!pricedProduct) {
    notFound()
  }

  return (
    <>
      <ProductJsonLd product={pricedProduct} countryCode={countryCode} />
      <BreadcrumbJsonLd
        countryCode={countryCode}
        items={[
          { name: "Home", path: "" },
          { name: "Store", path: "/store" },
          { name: pricedProduct.title || "Product", path: `/products/${handle}` },
        ]}
      />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={countryCode}
      />
    </>
  )
}
