import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import ScrollToTop from "@modules/common/components/scroll-to-top"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "Letscase",
    template: "%s | Letscase",
  },
  openGraph: {
    title: "Letscase",
    siteName: "Letscase",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Letscase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Letscase",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <ScrollToTop />
        <main id="top" className="relative">{props.children}</main>
      </body>
    </html>
  )
}
