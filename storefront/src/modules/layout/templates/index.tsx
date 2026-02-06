import React from "react"

import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import AnnouncementBar from "@modules/layout/components/announcement-bar"
import WhatsAppWidget from "@modules/common/components/whatsapp-widget"

const Layout: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <div>
      <AnnouncementBar />
      <Nav />
      <main className="relative">{children}</main>
      <Footer />
      <WhatsAppWidget />
    </div>
  )
}

export default Layout
