"use client"

import { useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[product-page-error]", error)
  }, [error])

  return (
    <div className="content-container py-20 flex flex-col items-center gap-6 text-center">
      <h2 className="text-2xl font-bold text-ui-fg-base">
        Unable to load product
      </h2>
      <p className="text-ui-fg-subtle max-w-md">
        We&apos;re having trouble loading this product. Please try again or
        browse other products.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-ui-button-inverted text-ui-fg-on-inverted rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          Try again
        </button>
        <LocalizedClientLink
          href="/store"
          className="px-5 py-2.5 border border-ui-border-base rounded-lg hover:bg-ui-bg-subtle transition-colors font-medium"
        >
          Browse products
        </LocalizedClientLink>
      </div>
    </div>
  )
}
