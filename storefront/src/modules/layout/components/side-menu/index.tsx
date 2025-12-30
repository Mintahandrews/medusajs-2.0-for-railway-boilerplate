"use client"

import { Disclosure, Popover, Transition } from "@headlessui/react"
import { Text, clx, useToggleState } from "@medusajs/ui"
import { Fragment, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, X, Search, ChevronRight } from "lucide-react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import { HttpTypes } from "@medusajs/types"
import { listCategories } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import Phone from "@modules/common/icons/phone"
import Laptop from "@modules/common/icons/laptop"
import Plug from "@modules/common/icons/plug"
import Headset from "@modules/common/icons/headset"
import Grid from "@modules/common/icons/grid"

const PRIMARY_LINKS: Array<{ name: string; href: string; testId: string }> = [
  { name: "Home", href: "/", testId: "home-link" },
  { name: "Deals", href: "/store?onSale=1", testId: "deals-link" },
  { name: "About Us", href: "/about-us", testId: "about-us-link" },
  { name: "Account", href: "/account", testId: "account-link" },
  { name: "Wishlist", href: "/account/wishlist", testId: "wishlist-link" },
  { name: "Search", href: "/search", testId: "search-link" },
  { name: "Cart", href: "/cart", testId: "cart-link" },
]

const SHOP_LINKS: Array<{ name: string; href: string }> = [
  { name: "All Products", href: "/store" },
  { name: "Accessories", href: "/store" },
  { name: "Chargers", href: "/store" },
  { name: "Earbuds", href: "/store" },
]

const TRENDING_LINKS: Array<{ name: string; href: string }> = [
  { name: "Best Sellers", href: "/store" },
  { name: "New Arrivals", href: "/store" },
  { name: "Top Rated", href: "/store" },
  { name: "Gift Ideas", href: "/store" },
]

const SideMenu = ({ regions }: { regions: HttpTypes.StoreRegion[] | null }) => {
  const toggleState = useToggleState()
  const router = useRouter()
  const [categoryLinks, setCategoryLinks] = useState<
    Array<{ name: string; href: string }>
  >([])
  const [collectionLinks, setCollectionLinks] = useState<
    Array<{ name: string; href: string }>
  >([])
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    let cancelled = false

    Promise.all([
      listCategories().catch(() => [] as any[]),
      getCollectionsList(0, 50).catch(() => ({ collections: [], count: 0 })),
    ])
      .then(([categories, collectionsResult]) => {
        if (cancelled) {
          return
        }

        const topLevelCategories = (categories as any[])
          .filter((c) => !c?.parent_category_id && !c?.parent_category)
          .filter((c) => c?.handle && c?.name)
          .slice(0, 12)
          .map((c) => ({
            name: c.name as string,
            href: `/categories/${c.handle}`,
          }))

        const collections = (collectionsResult as {
          collections: HttpTypes.StoreCollection[]
          count: number
        })?.collections

        const topCollections = (collections || [])
          .filter((c) => c?.handle && c?.title)
          .slice(0, 12)
          .map((c) => ({
            name: c.title as string,
            href: `/collections/${c.handle}`,
          }))

        setCategoryLinks(topLevelCategories)
        setCollectionLinks(topCollections)
      })
      .catch(() => {
        // Ignore fetch failures; we'll fall back to static links.
      })

    return () => {
      cancelled = true
    }
  }, [])

  const shopCategoryLinks = useMemo(() => {
    return categoryLinks.length ? categoryLinks.slice(0, 8) : []
  }, [categoryLinks])

  const shopCollectionLinks = useMemo(() => {
    return collectionLinks.length ? collectionLinks.slice(0, 4) : []
  }, [collectionLinks])

  const trendingLinks = useMemo(() => {
    return collectionLinks.length ? collectionLinks.slice(0, 8) : TRENDING_LINKS
  }, [collectionLinks])

  const iconForCategory = (name: string) => {
    const n = (name || "").toLowerCase()
    if (n.includes("phone") || n.includes("mobile")) return Phone
    if (
      n.includes("comput") ||
      n.includes("laptop") ||
      n.includes("mac") ||
      n.includes("ipad")
    )
      return Laptop
    if (
      n.includes("audio") ||
      n.includes("headphone") ||
      n.includes("ear") ||
      n.includes("speaker")
    )
      return Headset
    if (n.includes("charg") || n.includes("power") || n.includes("cable"))
      return Plug
    return Grid
  }

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center text-grey-90 transition-all ease-out duration-200 focus:outline-none"
                  aria-label={open ? "Close menu" : "Open menu"}
                >
                  <span className="sr-only">Menu</span>
                  <Menu className="text-grey-90" />
                </Popover.Button>
              </div>

              <Transition
                show={open}
                as={Fragment}
              >
                <div className="fixed inset-0 z-[80]">
                  <Transition.Child
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <button
                      type="button"
                      aria-label="Close menu overlay"
                      className="absolute inset-0 bg-black/50"
                      onClick={close}
                    />
                  </Transition.Child>

                  <Transition.Child
                    as={Fragment}
                    enter="transition ease-out duration-250"
                    enterFrom="-translate-x-full"
                    enterTo="translate-x-0"
                    leave="transition ease-in duration-200"
                    leaveFrom="translate-x-0"
                    leaveTo="-translate-x-full"
                  >
                    <Popover.Panel className="absolute inset-0 w-screen bg-white">
                      <div
                        data-testid="nav-menu-popup"
                        className="flex h-full flex-col"
                      >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-grey-20">
                          <div className="text-[16px] font-semibold text-grey-90">
                            Menu
                          </div>
                          <button
                            data-testid="close-menu-button"
                            onClick={close}
                            className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-grey-90 focus:outline-none"
                            aria-label="Close menu"
                            type="button"
                          >
                            <X />
                          </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-6">
                          <form
                            className="mb-5"
                            onSubmit={(e) => {
                              e.preventDefault()
                              const q = searchValue.trim()
                              if (!q) {
                                return
                              }

                              router.push(`/results/${encodeURIComponent(q)}`)
                              close()
                            }}
                          >
                            <label className="sr-only" htmlFor="drawer-search">
                              Search products
                            </label>
                            <div className="flex h-[48px] items-center gap-x-3 rounded-[16px] border border-grey-20 bg-white px-4">
                              <Search className="text-grey-50" size={20} />
                              <input
                                id="drawer-search"
                                type="search"
                                inputMode="search"
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck={false}
                                placeholder="Search products..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="h-full w-full bg-transparent text-[14px] text-grey-90 placeholder:text-grey-40 focus:outline-none"
                              />
                            </div>
                          </form>

                          <div className="space-y-3">
                            <Disclosure>
                              {({ open: disclosureOpen }) => (
                                <div className="rounded-[16px] border border-grey-20">
                                  <Disclosure.Button className="w-full px-5 py-4 flex items-center justify-between text-left">
                                    <span className="text-[15px] font-semibold text-grey-90">
                                      Shop
                                    </span>
                                    <ChevronRight
                                      size={20}
                                      className={clx(
                                        "transition-transform duration-150 text-grey-50",
                                        disclosureOpen ? "rotate-90" : ""
                                      )}
                                    />
                                  </Disclosure.Button>
                                  <Disclosure.Panel className="px-5 pb-5">
                                    <div className="flex flex-col gap-y-3 text-[13px] text-grey-50">
                                      {shopCategoryLinks.length ? (
                                        <>
                                          <div className="pt-1 text-[11px] font-semibold uppercase tracking-wide text-grey-50">
                                            Categories
                                          </div>
                                          {shopCategoryLinks.map((item) => {
                                            const Icon = iconForCategory(item.name)

                                            return (
                                              <LocalizedClientLink
                                                key={item.href}
                                                href={item.href}
                                                className="flex items-center gap-2 py-1 hover:text-grey-90"
                                                onClick={close}
                                              >
                                                <span className="shrink-0 text-grey-50">
                                                  <Icon size={16} />
                                                </span>
                                                <span>{item.name}</span>
                                              </LocalizedClientLink>
                                            )
                                          })}
                                        </>
                                      ) : null}

                                      {shopCollectionLinks.length ? (
                                        <>
                                          <div className="pt-4 text-[11px] font-semibold uppercase tracking-wide text-grey-50">
                                            Collections
                                          </div>
                                          {shopCollectionLinks.map((item) => (
                                            <LocalizedClientLink
                                              key={item.href}
                                              href={item.href}
                                              className="py-1 hover:text-grey-90"
                                              onClick={close}
                                            >
                                              {item.name}
                                            </LocalizedClientLink>
                                          ))}
                                        </>
                                      ) : null}

                                      {!shopCategoryLinks.length && !shopCollectionLinks.length
                                        ? SHOP_LINKS.map((item) => (
                                          <LocalizedClientLink
                                            key={item.name}
                                            href={item.href}
                                            className="py-1 hover:text-grey-90"
                                            onClick={close}
                                          >
                                            {item.name}
                                          </LocalizedClientLink>
                                        ))
                                        : null}
                                    </div>
                                  </Disclosure.Panel>
                                </div>
                              )}
                            </Disclosure>

                            <Disclosure>
                              {({ open: disclosureOpen }) => (
                                <div className="rounded-[16px] border border-grey-20">
                                  <Disclosure.Button className="w-full px-5 py-4 flex items-center justify-between text-left">
                                    <span className="text-[15px] font-semibold text-grey-90">
                                      Products
                                    </span>
                                    <ChevronRight
                                      size={20}
                                      className={clx(
                                        "transition-transform duration-150 text-grey-50",
                                        disclosureOpen ? "rotate-90" : ""
                                      )}
                                    />
                                  </Disclosure.Button>
                                  <Disclosure.Panel className="px-5 pb-5">
                                    <div className="flex flex-col gap-y-3 text-[13px] text-grey-50">
                                      {trendingLinks.map((item) => (
                                        <LocalizedClientLink
                                          key={item.href}
                                          href={item.href}
                                          className="py-1 hover:text-grey-90"
                                          onClick={close}
                                        >
                                          {item.name}
                                        </LocalizedClientLink>
                                      ))}
                                    </div>
                                  </Disclosure.Panel>
                                </div>
                              )}
                            </Disclosure>
                          </div>

                          <div className="mt-8">
                            <div className="text-[12px] font-semibold text-grey-50 uppercase tracking-wide">
                              Quick links
                            </div>
                            <ul className="mt-4 flex flex-col gap-y-3">
                              {PRIMARY_LINKS.map((item) => (
                                <li key={item.name}>
                                  <LocalizedClientLink
                                    href={item.href}
                                    className="block py-1 text-[14px] font-medium text-grey-90 hover:text-brand"
                                    onClick={close}
                                    data-testid={item.testId}
                                  >
                                    {item.name}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="border-t border-grey-20 px-6 py-5">
                          <button
                            type="button"
                            className="w-full flex items-center justify-between"
                            onClick={() =>
                              toggleState.state
                                ? toggleState.close()
                                : toggleState.open()
                            }
                            aria-label="Change shipping country"
                          >
                            {regions && (
                              <CountrySelect
                                toggleState={toggleState}
                                regions={regions}
                              />
                            )}
                            <ChevronRight
                              size={20}
                              className={clx(
                                "transition-transform duration-150 text-grey-50",
                                toggleState.state ? "rotate-90" : ""
                              )}
                            />
                          </button>

                          <Text className="mt-5 flex justify-between txt-compact-small text-grey-50">
                            © {new Date().getFullYear()} Letscase. All rights
                            reserved.
                          </Text>
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition.Child>
                </div>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
