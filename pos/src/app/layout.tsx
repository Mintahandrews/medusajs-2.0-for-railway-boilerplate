import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "react-hot-toast"
import { ThemeInitializer } from "@/components/theme-initializer"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://pos.letscasegh.com"),
  title: "Letscase POS",
  description: "Point of Sale System for Letscase",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Letscase POS",
    description: "Point of Sale System for Letscase",
    siteName: "Letscase POS",
    url: "https://pos.letscasegh.com",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Letscase Logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Letscase POS",
    description: "Point of Sale System for Letscase",
    images: ["https://pos.letscasegh.com/logo.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = JSON.parse(localStorage.getItem('letscase-pos-theme') || '{}');
                  var theme = (stored.state && stored.state.theme) || 'dark';
                  document.documentElement.className = theme;
                } catch(e) {
                  document.documentElement.className = 'dark';
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen antialiased font-sans`}>
        <ThemeInitializer />
        <div className="teal-accent-top">
          {children}
        </div>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--pos-toast-bg)",
              color: "var(--pos-toast-fg)",
              border: "1px solid var(--pos-toast-border)",
              fontSize: "13px",
            },
            success: {
              iconTheme: { primary: "#14b8a6", secondary: "var(--pos-toast-fg)" },
            },
          }}
        />
      </body>
    </html>
  )
}
