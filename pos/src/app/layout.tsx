import type { Metadata } from "next"
import { Toaster } from "react-hot-toast"
import { ThemeInitializer } from "@/components/theme-initializer"
import "./globals.css"

export const metadata: Metadata = {
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
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Letscase Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Letscase POS",
    description: "Point of Sale System for Letscase",
    images: ["/logo.png"],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
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
      <body className="min-h-screen antialiased font-sans">
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
