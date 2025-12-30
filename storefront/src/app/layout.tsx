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
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Letscase",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Letscase",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/icon.png", type: "image/png" }],
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
