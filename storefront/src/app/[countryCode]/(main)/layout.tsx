import { Metadata } from "next"
import dynamic from "next/dynamic"

import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import { getBaseURL } from "@lib/util/env"

// Lazy-load non-critical widgets — they are not needed for initial render
const WhatsAppWidget = dynamic(
  () => import("@modules/common/components/whatsapp-widget"),
  { ssr: false }
)
const CookieConsent = dynamic(
  () => import("@modules/common/components/cookie-consent"),
  { ssr: false }
)

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {props.children}
      <Footer />
      <WhatsAppWidget />
      <CookieConsent />
    </>
  )
}
