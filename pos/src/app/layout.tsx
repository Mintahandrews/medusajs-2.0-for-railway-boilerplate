import type { Metadata } from "next"
import { Toaster } from "react-hot-toast"
import "./globals.css"

export const metadata: Metadata = {
  title: "Letscase POS",
  description: "Point of Sale System for Letscase",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased font-sans">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#132626",
              color: "#e0f2f1",
              border: "1px solid #1e3a3a",
            },
          }}
        />
      </body>
    </html>
  )
}
