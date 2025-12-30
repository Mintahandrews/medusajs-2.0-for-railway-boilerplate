"use client"

import Link from "next/link"
import { useParams } from "next/navigation"

import WishlistButton from "@modules/common/components/wishlist-button"
import { useWishlist } from "@lib/hooks/use-wishlist"

export default function WishlistPage() {
  const { items, clear } = useWishlist()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || ""

  return (
    <div className="w-full" id="top">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-semibold">Wishlist</h1>
          <p className="text-ui-fg-subtle">
            Saved on this device (client-only).
          </p>
        </div>

        {items.length > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="rounded-full border border-ui-border-base bg-ui-bg-base px-4 py-2 text-sm font-medium text-ui-fg-base hover:border-ui-border-interactive hover:text-ui-fg-interactive"
          >
            Clear
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-lg border border-ui-border-base bg-ui-bg-base p-6">
          <p className="text-ui-fg-subtle">Your wishlist is empty.</p>
          <Link
            href={`/${countryCode}/store`}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-ui-bg-interactive px-5 py-2 text-sm font-medium text-ui-fg-on-color hover:bg-ui-bg-interactive-hover"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 small:grid-cols-2">
          {items.map((item) => {
            const href = `/${countryCode}/products/${item.handle}`

            return (
              <Link
                key={item.id}
                href={href}
                className="group flex items-center justify-between gap-4 rounded-lg border border-ui-border-base bg-ui-bg-base p-4 hover:border-ui-border-interactive"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ui-fg-base">
                    {item.title}
                  </p>
                  {item.price ? (
                    <p className="mt-1 text-sm text-ui-fg-subtle">{item.price}</p>
                  ) : null}
                </div>

                <div className="shrink-0">
                  <WishlistButton
                    item={item}
                    className="h-9 w-9 rounded-full border border-ui-border-base bg-ui-bg-base hover:border-ui-border-interactive"
                  />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
