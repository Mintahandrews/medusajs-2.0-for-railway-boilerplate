import { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  getCollectionByHandle,
  getCollectionsList,
} from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { StoreCollection, StoreRegion } from "@medusajs/types"
import CollectionTemplate from "@modules/collections/templates"
import BreadcrumbJsonLd from "@modules/seo/components/breadcrumb-jsonld"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{
    page?: string
    sortBy?: SortOptions
  }>
}

export const PRODUCT_LIMIT = 12

export async function generateStaticParams() {
  try {
    const { collections } = await getCollectionsList()

    if (!collections?.length) {
      return []
    }

    const countryCodes = await listRegions().then(
      (regions: StoreRegion[]) =>
        regions
          ?.map((r) => r.countries?.map((c) => c.iso_2))
          .flat()
          .filter(Boolean) as string[]
    )

    if (!countryCodes?.length) {
      return []
    }

    const collectionHandles = collections
      .map((collection: StoreCollection) => collection.handle)
      .filter(Boolean) as string[]

    return countryCodes
      .map((countryCode: string) =>
        collectionHandles.map((handle: string) => ({
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
    const { handle } = await params
    const collection = await getCollectionByHandle(handle)

    if (!collection) {
      notFound()
    }

    const description = `Shop ${collection.title} at Letscase Ghana. Browse our curated collection of premium phone cases and tech accessories. Fast delivery across Ghana.`

    return {
      title: `${collection.title}`,
      description,
      openGraph: {
        title: `${collection.title} | Letscase`,
        description,
      },
    } as Metadata
  } catch {
    return {
      title: "Collection",
      description: "Browse premium phone cases and tech accessories at Letscase Ghana.",
    }
  }
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { handle, countryCode } = await params
  const { sortBy, page } = await searchParams

  const collection = await getCollectionByHandle(handle).then(
    (collection: StoreCollection) => collection
  )

  if (!collection) {
    notFound()
  }

  return (
    <>
      <BreadcrumbJsonLd
        countryCode={countryCode}
        items={[
          { name: "Home", path: "" },
          { name: "Store", path: "/store" },
          { name: collection.title || "Collection", path: `/collections/${handle}` },
        ]}
      />
      <CollectionTemplate
        collection={collection}
        page={page}
        sortBy={sortBy}
        countryCode={countryCode}
      />
    </>
  )
}
