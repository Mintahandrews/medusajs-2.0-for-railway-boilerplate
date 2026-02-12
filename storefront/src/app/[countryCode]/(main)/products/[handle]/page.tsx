import { Metadata } from "next"
import { notFound } from "next/navigation"

import ProductTemplate from "@modules/products/templates"
import ProductJsonLd from "@modules/seo/components/product-jsonld"
import BreadcrumbJsonLd from "@modules/seo/components/breadcrumb-jsonld"
import { getRegion, listRegions } from "@lib/data/regions"
import { getProductByHandle, getProductsList } from "@lib/data/products"
import { getBaseURL } from "@lib/util/env"

type Props = {
  params: { countryCode: string; handle: string }
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
  try {
    const { handle } = params
    const region = await getRegion(params.countryCode)

    if (!region) {
      notFound()
    }

    const product = await getProductByHandle(handle, region.id)

    if (!product) {
      notFound()
    }

    const baseUrl = getBaseURL()
    const url = `${baseUrl}/${params.countryCode}/products/${handle}`
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
    return {
      title: "Product",
      description: "Premium phone cases and tech accessories at Letscase Ghana.",
    }
  }
}

export default async function ProductPage({ params }: Props) {
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const pricedProduct = await getProductByHandle(params.handle, region.id)
  if (!pricedProduct) {
    notFound()
  }

  return (
    <>
      <ProductJsonLd product={pricedProduct} countryCode={params.countryCode} />
      <BreadcrumbJsonLd
        countryCode={params.countryCode}
        items={[
          { name: "Home", path: "" },
          { name: "Store", path: "/store" },
          { name: pricedProduct.title || "Product", path: `/products/${params.handle}` },
        ]}
      />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
      />
    </>
  )
}
