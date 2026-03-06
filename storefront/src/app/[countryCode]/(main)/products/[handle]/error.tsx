"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[ProductPage] Error:", error)
  }, [error])

  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <h1 className="text-2xl-semi text-ui-fg-base">
        Something went wrong
      </h1>
      <p className="text-small-regular text-ui-fg-muted text-center max-w-md">
        We couldn&apos;t load this product. This could be a temporary issue —
        please try again.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-md bg-ui-bg-interactive text-ui-fg-on-color text-small-semi hover:bg-ui-bg-interactive-hover transition-colors"
        >
          Try again
        </button>
        <Link
          href="/store"
          className="px-4 py-2 rounded-md border border-ui-border-base text-ui-fg-base text-small-semi hover:bg-ui-bg-subtle transition-colors"
        >
          Browse store
        </Link>
      </div>
    </div>
  )
}
