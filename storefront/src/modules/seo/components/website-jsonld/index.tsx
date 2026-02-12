import { getBaseURL } from "@lib/util/env"

export default function WebsiteJsonLd() {
  const baseUrl = getBaseURL()

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Letscase",
      url: baseUrl,
      logo: `${baseUrl}/icon.svg`,
      sameAs: [],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: "English",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Letscase",
      url: baseUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/gh/results/{search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ]

  return (
    <>
      {jsonLd.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  )
}
