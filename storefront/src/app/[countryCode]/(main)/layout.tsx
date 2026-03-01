import { Metadata } from "next"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import { getBaseURL } from "@lib/util/env"
import WhatsAppWidget from "@modules/common/components/whatsapp-widget-client"
import CookieConsent from "@modules/common/components/cookie-consent-client"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {/* pt-[72px] offsets the fixed nav; the homepage hero uses -mt-[72px] to slide under it */}
      <main className="pt-[72px]">
        {props.children}
      </main>
      <Footer />
      <WhatsAppWidget />
      <CookieConsent />
    </>
  )
}
