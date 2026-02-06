"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useMemo, useState } from "react"
import { Heart, Copy, FileJson, Trash2, ArrowRight } from "lucide-react"

import WishlistButton from "@modules/common/components/wishlist-button"
import { useWishlist } from "@lib/hooks/use-wishlist"

export default function WishlistPage() {
  const { items, clear } = useWishlist()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || ""

  const [copied, setCopied] = useState<null | "titles" | "json">(null)

  const shareText = useMemo(() => {
    const titles = items.map((i) => `- ${i.title}`).join("\n")
    return `Letscase wishlist\n\n${titles}`
  }, [items])

  const shareJson = useMemo(() => {
    return JSON.stringify(items, null, 2)
  }, [items])

  const copy = async (type: "titles" | "json") => {
    try {
      await navigator.clipboard.writeText(type === "json" ? shareJson : shareText)
      setCopied(type)
      window.setTimeout(() => setCopied(null), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div className="w-full" data-testid="wishlist-page-wrapper">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex flex-col gap-y-1">
          <h1 className="text-2xl-semi flex items-center gap-2">
            <Heart size={22} className="text-ui-fg-interactive" />
            Wishlist
          </h1>
          <p className="text-base-regular text-ui-fg-subtle">
            {items.length} saved item{items.length !== 1 ? "s" : ""}
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => copy("titles")}
              className="flex items-center gap-1.5 rounded-full border border-ui-border-base bg-ui-bg-base px-3.5 py-2 text-small-regular font-medium text-ui-fg-base hover:bg-ui-bg-base-hover transition-colors"
            >
              <Copy size={14} />
              {copied === "titles" ? "Copied!" : "Copy"}
            </button>
            <button
              type="button"
              onClick={() => copy("json")}
              className="flex items-center gap-1.5 rounded-full border border-ui-border-base bg-ui-bg-base px-3.5 py-2 text-small-regular font-medium text-ui-fg-base hover:bg-ui-bg-base-hover transition-colors"
            >
              <FileJson size={14} />
              {copied === "json" ? "Copied!" : "Export"}
            </button>
            <button
              type="button"
              onClick={clear}
              className="flex items-center gap-1.5 rounded-full border border-ui-border-base bg-ui-bg-base px-3.5 py-2 text-small-regular font-medium text-ui-fg-base hover:bg-ui-bg-base-hover transition-colors"
            >
              <Trash2 size={14} />
              Clear
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-rounded border border-ui-border-base bg-ui-bg-subtle p-8 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-ui-bg-base flex items-center justify-center mb-4">
            <Heart size={24} className="text-ui-fg-muted" />
          </div>
          <p className="text-ui-fg-subtle text-base-regular mb-4">
            Your wishlist is empty.
          </p>
          <Link
            href={`/${countryCode}/store`}
            className="inline-flex items-center gap-1.5 rounded-full bg-ui-button-inverted px-5 py-2.5 text-small-semi text-ui-fg-on-inverted hover:bg-ui-button-inverted-hover transition-colors"
          >
            Browse products
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 small:grid-cols-2">
          {items.map((item) => {
            const href = `/${countryCode}/products/${item.handle}`

            return (
              <div
                key={item.id}
                className="group flex items-center gap-4 rounded-rounded border border-ui-border-base bg-ui-bg-base p-4 hover:shadow-elevation-card-hover transition-shadow"
              >
                {/* Thumbnail */}
                {item.image && (
                  <Link href={href} className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-16 w-16 rounded-soft object-cover bg-ui-bg-subtle"
                    />
                  </Link>
                )}

                {/* Info */}
                <Link href={href} className="min-w-0 flex-1">
                  <p className="truncate text-small-semi text-ui-fg-base group-hover:text-ui-fg-interactive transition-colors">
                    {item.title}
                  </p>
                  {item.price && (
                    <p className="mt-0.5 text-small-regular text-ui-fg-subtle">
                      {item.price}
                    </p>
                  )}
                </Link>

                {/* Remove button */}
                <div className="shrink-0">
                  <WishlistButton item={item} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
