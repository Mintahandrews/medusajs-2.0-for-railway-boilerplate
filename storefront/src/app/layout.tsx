import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
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
        url: "/letscase-logo.png",
        width: 1200,
        height: 630,
        alt: "Letscase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Letscase",
    images: ["/letscase-logo.png"],
  },
  icons: {
    icon: [
      { url: "/letscase-logo.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/letscase-logo.png", type: "image/png", sizes: "180x180" }],
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <main id="top" className="relative">{props.children}</main>
      </body>
    </html>
  )
}
