"use client"

import Image from "next/image"
import { useMemo, useState } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WishlistButton from "@modules/common/components/wishlist-button"

type CarouselItem =
  | {
    id: string
    title: string
    href: string
    image: string
    price: string
  }
  | {
    title: string
    image: string
    price: string
  }

export default function ProductCarousel({ items, autoScroll = true }: { items: CarouselItem[]; autoScroll?: boolean }) {
  const [paused, setPaused] = useState(false)

  const normalized = useMemo(() => {
    return items.map((item, idx) => {
      if ("id" in item) return item
      return {
        id: `placeholder-${idx}`,
        title: item.title,
        href: "/store",
        image: item.image,
        price: item.price,
      }
    })
  }, [items])

  const displayItems = normalized.slice(0, 8)
  // Duplicate items for seamless infinite loop
  const loopItems = [...displayItems, ...displayItems]

  // Duration scales with item count for consistent speed (~4s per card)
  const duration = displayItems.length * 4

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div
        className="flex gap-4 w-max pb-2"
        style={{
          animation: autoScroll
            ? `marquee ${duration}s linear infinite`
            : undefined,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {loopItems.map((item, idx) => (
          <LocalizedClientLink
            key={`${item.id}-${idx}`}
            href={item.href}
            className="group shrink-0 w-[240px] small:w-[250px] bg-grey-10 rounded-[16px] p-4 transition duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 block"
          >
            <div className="relative bg-white rounded-[14px] overflow-hidden mb-4">
              <div className="absolute right-3 top-3 z-10">
                <WishlistButton
                  item={{
                    id: item.id,
                    handle: item.href.replace("/products/", ""),
                    title: item.title,
                    image: item.image,
                    price: item.price,
                  }}
                />
              </div>
              <div className="relative aspect-square w-full">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="280px"
                  className="object-contain scale-[1.12]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-[15px] font-medium text-grey-90 line-clamp-2 min-h-[46px]">
                {item.title}
              </div>
              <div className="text-[18px] font-semibold text-grey-90">
                {item.price}
              </div>
            </div>
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}
