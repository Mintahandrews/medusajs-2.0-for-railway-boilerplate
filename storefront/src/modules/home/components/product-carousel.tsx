"use client"

import Image from "next/image"
import { useMemo, useRef } from "react"

import Heart from "@modules/common/icons/heart"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

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

export default function ProductCarousel({ items }: { items: CarouselItem[] }) {
  const viewportRef = useRef<HTMLDivElement | null>(null)

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

  const scrollByCards = (direction: "left" | "right") => {
    const viewport = viewportRef.current
    if (!viewport) return
    const width = viewport.clientWidth
    viewport.scrollBy({
      left: direction === "left" ? -width : width,
      behavior: "smooth",
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="hidden small:flex absolute -left-5 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-grey-20 bg-white text-grey-40 shadow-md z-10 hover:bg-brand hover:text-white hover:border-brand transition duration-300"
        aria-label="Previous"
        onClick={() => scrollByCards("left")}
      >
        ←
      </button>
      <button
        type="button"
        className="hidden small:flex absolute -right-5 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black text-white hover:bg-brand transition duration-300 shadow-md z-10"
        aria-label="Next"
        onClick={() => scrollByCards("right")}
      >
        →
      </button>

      <div
        ref={viewportRef}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-2"
      >
        {normalized.slice(0, 8).map((item) => (
          <LocalizedClientLink
            key={item.id}
            href={item.href}
            className="group snap-start shrink-0 w-[260px] small:w-[280px] bg-grey-5 rounded-[12px] p-4 transition duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 block"
          >
            <div className="relative bg-white rounded-[8px] overflow-hidden mb-4">
              <div className="relative aspect-square w-full">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="280px"
                  className="object-contain p-6"
                />
              </div>
              <button
                type="button"
                className="absolute top-2 right-2 h-9 w-9 rounded-full bg-white shadow-sm flex items-center justify-center hover:scale-110 transition text-grey-90 hover:text-red-500"
                aria-label="Add to wishlist"
                onClick={(e) => {
                  e.preventDefault()
                  // Add wishlist logic here
                }}
              >
                <Heart size={20} />
              </button>
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
