"use client"

import { useEffect } from "react"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[global-error]", error)
  }, [error])

  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <div className="min-h-screen flex items-center justify-center bg-grey-5 px-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-grey-90 mb-2">
              Something went wrong
            </h2>
            <p className="text-grey-50 mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="px-5 py-2.5 bg-brand text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
              >
                Try again
              </button>
              <a
                href="/"
                className="px-5 py-2.5 border border-grey-30 rounded-lg hover:bg-grey-10 transition-colors font-medium"
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
