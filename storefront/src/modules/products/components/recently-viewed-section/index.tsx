"use client"

import { useRecentlyViewed } from "@lib/hooks/use-recently-viewed"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Clock } from "lucide-react"

type Props = {
  excludeProductId?: string
}

export default function RecentlyViewedSection({ excludeProductId }: Props) {
  const { items } = useRecentlyViewed(excludeProductId)

  if (items.length === 0) return null

  return (
    <div className="py-12">
      <div className="flex items-center gap-2 mb-6">
        <Clock size={18} className="text-grey-50" />
        <h2 className="text-[18px] font-semibold text-grey-90">
          Recently Viewed
        </h2>
      </div>

      <div className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 large:grid-cols-6 gap-4">
        {items.slice(0, 6).map((item) => (
          <LocalizedClientLink
            key={item.id}
            href={`/products/${item.handle}`}
            className="group"
          >
            <div className="aspect-square overflow-hidden rounded-xl bg-grey-5 border border-grey-10">
              {item.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-grey-30 text-[11px]">
                  No image
                </div>
              )}
            </div>
            <p className="mt-2 text-[13px] text-grey-60 truncate group-hover:text-grey-90 transition">
              {item.title}
            </p>
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}
