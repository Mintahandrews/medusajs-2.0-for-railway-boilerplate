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
  params: { handle: string; countryCode: string }
  searchParams: {
    page?: string
    sortBy?: SortOptions
  }
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
    const collection = await getCollectionByHandle(params.handle)

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
  const { sortBy, page } = searchParams

  const collection = await getCollectionByHandle(params.handle).then(
    (collection: StoreCollection) => collection
  )

  if (!collection) {
    notFound()
  }

  return (
    <>
      <BreadcrumbJsonLd
        countryCode={params.countryCode}
        items={[
          { name: "Home", path: "" },
          { name: "Store", path: "/store" },
          { name: collection.title || "Collection", path: `/collections/${params.handle}` },
        ]}
      />
      <CollectionTemplate
        collection={collection}
        page={page}
        sortBy={sortBy}
        countryCode={params.countryCode}
      />
    </>
  )
}
