import type { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseURL()

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/account/",
          "/checkout/",
          "/order/",
          "/cart/",
          "/results/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
