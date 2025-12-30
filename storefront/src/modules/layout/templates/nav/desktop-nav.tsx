"use client"

import Image from "next/image"
import { usePathname, useSearchParams } from "next/navigation"

import ChevronDown from "@modules/common/icons/chevron-down"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Phone from "@modules/common/icons/phone"
import Laptop from "@modules/common/icons/laptop"
import Plug from "@modules/common/icons/plug"
import Headset from "@modules/common/icons/headset"
import Grid from "@modules/common/icons/grid"

type LinkItem = { name: string; href: string }

type MegaCategory = {
  name: string
  href: string
  children?: Array<{ name: string; href: string }>
}

function stripCountryCode(pathname: string) {
  const parts = pathname.split("/").filter(Boolean)
  if (parts.length && parts[0].length === 2) {
    parts.shift()
  }
  return `/${parts.join("/")}` || "/"
}

function iconForCategory(name: string) {
  const n = (name || "").toLowerCase()
  if (n.includes("phone") || n.includes("mobile")) return Phone
  if (n.includes("comput") || n.includes("laptop") || n.includes("mac") || n.includes("ipad"))
    return Laptop
  if (n.includes("audio") || n.includes("headphone") || n.includes("ear") || n.includes("speaker"))
    return Headset
  if (n.includes("charg") || n.includes("power") || n.includes("cable")) return Plug
  return Grid
}

function navLinkClass(active: boolean) {
  return active
    ? "pb-1 border-b-2 border-black text-grey-90"
    : "pb-1 border-b-2 border-transparent text-grey-90 hover:text-brand"
}

export default function DesktopNav(props: {
  megaCategories: MegaCategory[]
  trendingCollectionsCol1: LinkItem[]
  trendingCollectionsCol2: LinkItem[]
  exploreLinks: LinkItem[]
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const normalized = stripCountryCode(pathname || "/")
  const onSale = searchParams?.get("onSale") === "1"

  const isHome = normalized === "/"
  const isAbout = normalized === "/about-us"
  const isDeals = normalized === "/store" && onSale
  const isShop = normalized.startsWith("/categories")
  const isProducts =
    (!onSale && normalized === "/store") || normalized.startsWith("/collections")

  return (
    <div className="hidden small:flex items-center gap-x-8 text-[14px] font-medium text-grey-90">
      <LocalizedClientLink href="/" className={navLinkClass(isHome)}>
        Home
      </LocalizedClientLink>

      <div className="relative group/shop">
        <LocalizedClientLink
          href="/store"
          className={`inline-flex items-center gap-x-1 ${navLinkClass(isShop)}`}
          aria-haspopup="true"
        >
          Shop
          <span className="text-grey-50 group-hover/shop:text-brand transition-transform duration-200 group-hover/shop:rotate-180">
            <ChevronDown size={16} />
          </span>
        </LocalizedClientLink>

        <div className="fixed left-0 right-0 top-[70px] z-50 hidden group-hover/shop:block group-focus-within/shop:block">
          <div className="bg-white border-b border-grey-20 shadow-lg">
            <div className="mx-auto max-w-[1440px] px-5 small:px-10 py-8">
              <div className="grid grid-cols-5 gap-8">
                <div className="col-span-4">
                  <div className="grid grid-cols-1 medium:grid-cols-2 gap-4">
                    {props.megaCategories.map((c) => {
                      const Icon = iconForCategory(c.name)
                      return (
                        <div
                          key={c.href}
                          className="rounded-[16px] border border-grey-20 p-5 transition duration-300 hover:bg-grey-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-[12px] border border-grey-20 bg-white flex items-center justify-center text-grey-90">
                                <Icon size={22} color="currentColor" />
                              </div>
                              <div>
                                <div className="text-[14px] font-semibold text-grey-90">
                                  {c.name}
                                </div>
                                <LocalizedClientLink
                                  href={c.href}
                                  className="mt-1 inline-block text-[12px] font-semibold text-grey-90 hover:text-brand"
                                >
                                  View all →
                                </LocalizedClientLink>
                              </div>
                            </div>
                          </div>

                          {c.children?.length ? (
                            <div className="mt-4 grid grid-cols-1 gap-2 text-[13px] text-grey-50">
                              {c.children.map((cc) => (
                                <LocalizedClientLink
                                  key={cc.href}
                                  href={cc.href}
                                  className="hover:text-grey-90"
                                >
                                  {cc.name}
                                </LocalizedClientLink>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-4 text-[13px] text-grey-50">
                              <LocalizedClientLink
                                href={c.href}
                                className="hover:text-grey-90"
                              >
                                Browse {c.name}
                              </LocalizedClientLink>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-5">
                    <LocalizedClientLink
                      href="/store"
                      className="text-[12px] font-semibold text-grey-90 hover:text-brand"
                    >
                      View all products
                    </LocalizedClientLink>
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="relative h-full min-h-[220px] overflow-hidden rounded-[20px] bg-grey-5">
                    <Image
                      src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=80"
                      alt="Featured products"
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="text-white text-[14px] font-semibold">
                        Shop the latest gear
                      </div>
                      <div className="mt-2">
                        <LocalizedClientLink
                          href="/store"
                          className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-grey-90"
                        >
                          Browse Store
                        </LocalizedClientLink>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative group/trending">
        <LocalizedClientLink
          href="/store"
          className={`inline-flex items-center gap-x-1 ${navLinkClass(isProducts)}`}
          aria-haspopup="true"
        >
          Products
          <span className="text-grey-50 group-hover/trending:text-brand transition-transform duration-200 group-hover/trending:rotate-180">
            <ChevronDown size={16} />
          </span>
        </LocalizedClientLink>

        <div className="fixed left-0 right-0 top-[70px] z-50 hidden group-hover/trending:block group-focus-within/trending:block">
          <div className="bg-white border-b border-grey-20 shadow-lg">
            <div className="mx-auto max-w-[1440px] px-5 small:px-10 py-8">
              <div className="grid grid-cols-5 gap-8">
                <div className="col-span-2">
                  <div className="text-[13px] font-semibold text-grey-90">
                    Collections
                  </div>
                  <div className="mt-4 flex flex-col gap-y-3 text-[13px] text-grey-50">
                    {props.trendingCollectionsCol1.map((item) => (
                      <LocalizedClientLink
                        key={item.href}
                        href={item.href}
                        className="hover:text-grey-90"
                      >
                        {item.name}
                      </LocalizedClientLink>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="text-[13px] font-semibold text-grey-90">
                    Collections
                  </div>
                  <div className="mt-4 flex flex-col gap-y-3 text-[13px] text-grey-50">
                    {props.trendingCollectionsCol2.map((item) => (
                      <LocalizedClientLink
                        key={item.href}
                        href={item.href}
                        className="hover:text-grey-90"
                      >
                        {item.name}
                      </LocalizedClientLink>
                    ))}
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="text-[13px] font-semibold text-grey-90">
                    Explore
                  </div>
                  <div className="mt-4 flex flex-col gap-y-3 text-[13px] text-grey-50">
                    {props.exploreLinks.map((l) => (
                      <LocalizedClientLink
                        key={l.href}
                        href={l.href}
                        className="hover:text-grey-90"
                      >
                        {l.name}
                      </LocalizedClientLink>
                    ))}
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="relative h-full min-h-[220px] overflow-hidden rounded-[20px] bg-grey-5">
                    <Image
                      src="https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=1200&auto=format&fit=crop&q=80"
                      alt="Trending gear"
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="text-white text-[14px] font-semibold">
                        Trending picks
                      </div>
                      <div className="mt-2">
                        <LocalizedClientLink
                          href="/store"
                          className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-grey-90"
                        >
                          Explore
                        </LocalizedClientLink>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LocalizedClientLink href="/store?onSale=1" className={navLinkClass(isDeals)}>
        Deals
      </LocalizedClientLink>
      <LocalizedClientLink href="/about-us" className={navLinkClass(isAbout)}>
        About Us
      </LocalizedClientLink>
    </div>
  )
}
