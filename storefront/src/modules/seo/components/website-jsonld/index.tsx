import { getBaseURL } from "@lib/util/env"

export default function WebsiteJsonLd() {
  const baseUrl = getBaseURL()

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Letscase",
      legalName: "Letscase Ghana",
      url: "https://letscasegh.com",
      logo: `${baseUrl}/icon.svg`,
      sameAs: [
        "https://www.instagram.com/letscasegh",
        "https://www.facebook.com/letscasegh",
        "https://www.tiktok.com/@letscasegh",
        "https://x.com/letscasegh",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+233-540-451-001",
        contactType: "customer service",
        areaServed: "GH",
        availableLanguage: "English",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": "https://letscasegh.com/#store",
      name: "Letscase Ghana - Main Store",
      image: `${baseUrl}/icon.svg`,
      url: "https://letscasegh.com",
      telephone: "+233-540-451-001",
      priceRange: "GH₵",
      address: {
        "@type": "PostalAddress",
        streetAddress: "E123 Prince Okai St",
        addressLocality: "Accra",
        addressRegion: "Greater Accra",
        addressCountry: "GH",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 5.623555,
        longitude: -0.237199,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "08:00",
          closes: "20:00",
        },
      ],
      hasMap: "https://www.google.com/maps/dir/?api=1&destination=LetsCase+Gh",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Letscase",
      url: "https://letscasegh.com",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://letscasegh.com/gh/results/{search_term_string}",
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
