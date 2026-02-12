import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
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
          "/search/",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/", "/account/", "/checkout/"],
      },
    ],
    sitemap: "https://letscasegh.com/sitemap.xml",
  }
}
