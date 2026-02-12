import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import ScrollToTop from "@modules/common/components/scroll-to-top"
import WebsiteJsonLd from "@modules/seo/components/website-jsonld"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "Letscase Ghana - Premium Phone Cases & Tech Accessories",
    template: "%s | Letscase",
  },
  description:
    "Shop premium phone cases, custom designer cases, laptop bags, chargers and tech accessories in Ghana. Fast delivery across Accra & nationwide. Free shipping over GH\u20B5200.",
  keywords: [
    "phone cases Ghana",
    "iPhone cases Accra",
    "Samsung cases Ghana",
    "custom phone cases",
    "designer phone cases",
    "tech accessories Ghana",
    "laptop bags",
    "phone chargers",
    "Letscase",
  ],
  alternates: {
    canonical: getBaseURL(),
  },
  openGraph: {
    title: "Letscase Ghana - Premium Phone Cases & Tech Accessories",
    description:
      "Shop premium phone cases, custom designer cases, laptop bags, chargers and tech accessories in Ghana. Fast delivery across Accra & nationwide.",
    siteName: "Letscase",
    type: "website",
    locale: "en_GH",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Letscase - Premium Phone Cases & Tech Accessories in Ghana",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Letscase Ghana - Premium Phone Cases & Tech Accessories",
    description:
      "Shop premium phone cases, custom designer cases & tech accessories in Ghana. Fast delivery across Accra & nationwide.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <head>
        <WebsiteJsonLd />
      </head>
      <body>
        <ScrollToTop />
        <main id="top" className="relative">{props.children}</main>
      </body>
    </html>
  )
}
