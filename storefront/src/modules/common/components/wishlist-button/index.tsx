"use client"

import { Heart } from "lucide-react"
import { useMemo } from "react"
import { WishlistItem, useWishlist } from "@lib/hooks/use-wishlist"

export default function WishlistButton({
  item,
  className,
}: {
  item: WishlistItem
  className?: string
}) {
  const { toggle, isInWishlist } = useWishlist()

  const active = useMemo(() => isInWishlist(item.id), [isInWishlist, item.id])

  return (
    <button
      type="button"
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={
        className ||
        "h-10 w-10 rounded-full bg-white/95 border border-grey-20 flex items-center justify-center text-grey-90 hover:bg-brand hover:border-brand hover:text-white transition"
      }
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(item)
      }}
    >
      <Heart
        size={18}
        className={active ? "fill-current" : ""}
      />
    </button>
  )
}
