import { getBaseURL } from "@lib/util/env"

type BreadcrumbItem = {
  name: string
  path: string
}

type Props = {
  items: BreadcrumbItem[]
  countryCode: string
}

export default function BreadcrumbJsonLd({ items, countryCode }: Props) {
  const baseUrl = getBaseURL()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}/${countryCode}${item.path}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
