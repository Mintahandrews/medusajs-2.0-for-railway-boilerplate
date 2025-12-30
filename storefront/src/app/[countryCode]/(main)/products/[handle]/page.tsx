import { Metadata } from "next"
import { notFound } from "next/navigation"

import ProductTemplate from "@modules/products/templates"
import { getRegion, listRegions } from "@lib/data/regions"
import { getProductByHandle, getProductsList } from "@lib/data/products"

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

    return {
      title: `${product.title} | Letscase`,
      description: `${product.title}`,
      openGraph: {
        title: `${product.title} | Letscase`,
        description: `${product.title}`,
        images: product.thumbnail ? [product.thumbnail] : [],
      },
    }
  } catch {
    return {
      title: "Product | Letscase",
      description: "Product",
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
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
    />
  )
}
