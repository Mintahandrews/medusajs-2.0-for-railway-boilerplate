import { Metadata } from "next"

import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import WhatsAppWidget from "@modules/common/components/whatsapp-widget"
import CookieConsent from "@modules/common/components/cookie-consent"
import { getBaseURL } from "@lib/util/env"

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
