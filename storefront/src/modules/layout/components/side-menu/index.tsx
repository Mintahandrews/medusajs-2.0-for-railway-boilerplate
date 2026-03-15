"use client"

import { Disclosure } from "@headlessui/react"
import { Text, clx, useToggleState } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Menu, X, Search, ChevronRight } from "lucide-react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import { HttpTypes } from "@medusajs/types"
import { getCategoryIcon } from "@lib/util/category-icon"

/** Lock body scroll while the sidebar is open (works on iOS Safari too) */
function ScrollLock({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return
    const scrollY = window.scrollY
    const html = document.documentElement
    const body = document.body

    // Save previous values
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    const prevBodyPosition = body.style.position
    const prevBodyTop = body.style.top
    const prevBodyLeft = body.style.left
    const prevBodyRight = body.style.right

    // Lock: position:fixed preserves scroll pos, overflow:hidden on both html & body
    html.style.overflow = "hidden"
    body.style.overflow = "hidden"
    body.style.position = "fixed"
    body.style.top = `-${scrollY}px`
    body.style.left = "0"
    body.style.right = "0"

    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
      body.style.position = prevBodyPosition
      body.style.top = prevBodyTop
      body.style.left = prevBodyLeft
      body.style.right = prevBodyRight
      window.scrollTo(0, scrollY)
    }
  }, [active])
  return null
}

const PRIMARY_LINKS: Array<{ name: string; href: string; testId: string }> = [
  { name: "Home", href: "/", testId: "home-link" },
  { name: "Design Your Case", href: "/customizer", testId: "customizer-link" },
  { name: "Deals", href: "/deals", testId: "deals-link" },
  { name: "Account", href: "/account", testId: "account-link" },
  { name: "Contact", href: "/contact", testId: "contact-link" },
  { name: "Order Tracking", href: "/order-tracking", testId: "order-tracking-link" },
]


const TRENDING_LINKS: Array<{ name: string; href: string }> = [
  { name: "Best Sellers", href: "/store" },
  { name: "New Arrivals", href: "/store" },
  { name: "Top Rated", href: "/store" },
  { name: "Gift Ideas", href: "/store" },
]

const SideMenu = ({
  regions,
  initialCategories = [],
  initialCollections = [],
}: {
  regions: HttpTypes.StoreRegion[] | null
  initialCategories?: Array<{ name: string; href: string }>
  initialCollections?: Array<{ name: string; href: string }>
}) => {
  const toggleState = useToggleState()
  const router = useRouter()
  const params = useParams()
  const countryCode = (params as any)?.countryCode as string | undefined
  const categoryLinks = initialCategories
  const collectionLinks = initialCollections
  const [searchValue, setSearchValue] = useState("")

  const shopCategoryLinks = useMemo(() => {
    return categoryLinks.length ? categoryLinks.slice(0, 8) : []
  }, [categoryLinks])

  const shopCollectionLinks = useMemo(() => {
    // Show more collections in the mobile menu and allow horizontal scrolling
    return collectionLinks.length ? collectionLinks.slice(0, 12) : []
  }, [collectionLinks])

  const trendingLinks = useMemo(() => {
    return collectionLinks.length ? collectionLinks.slice(0, 8) : TRENDING_LINKS
  }, [collectionLinks])

  const iconForCategory = (name: string) => getCategoryIcon(name)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const open = () => setDrawerOpen(true)
  const close = () => setDrawerOpen(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close drawer on route change
  const pathname = usePathname()
  useEffect(() => {
    close()
  }, [pathname])

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <div className="relative flex h-full">
          <button
            data-testid="nav-menu-button"
            className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none"
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            onClick={open}
            type="button"
          >
            <span className="sr-only">Menu</span>
            <Menu />
          </button>
        </div>

        <ScrollLock active={drawerOpen} />

        {/* Portal the backdrop + drawer to <body> so they escape the navbar's z-50 stacking context */}
        {mounted &&
          createPortal(
            <>
              {/* Backdrop */}
              <div
                className={`fixed inset-0 z-[70] bg-black/50 transition-opacity duration-300 ${
                  drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={close}
                aria-hidden="true"
              />

              {/* Slide-out drawer */}
              <div
                className={`fixed top-0 left-0 z-[80] h-full w-[85vw] max-w-[400px] bg-white shadow-2xl border-r border-gray-200 transform transition-transform duration-300 ease-out ${
                  drawerOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                data-testid="nav-menu-popup"
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                    <div className="text-[16px] font-semibold text-gray-900 drop-shadow-sm">
                      Menu
                    </div>
                    <button
                      data-testid="close-menu-button"
                      onClick={close}
                      className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
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
                        if (!q) return

                        const target = countryCode
                          ? `/${countryCode}/results/${encodeURIComponent(q)}`
                          : `/results/${encodeURIComponent(q)}`

                        close()
                        router.push(target)
                      }}
                    >
                      <label className="sr-only" htmlFor="drawer-search">
                        Search products
                      </label>
                      <div className="flex h-[50px] items-center gap-x-3 rounded-full border border-gray-700 bg-gray-800 px-5">
                        <Search className="text-gray-400 shrink-0" size={20} />
                        <input
                          id="drawer-search"
                          type="search"
                          inputMode="search"
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          placeholder="Search"
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          className="h-full w-full bg-transparent text-[15px] text-gray-900 placeholder:text-gray-500 focus:outline-none"
                        />
                      </div>
                    </form>

                    <div className="space-y-3">
                      <Disclosure>
                        {({ open: disclosureOpen }) => (
                          <div className="rounded-[16px] border border-gray-200 bg-gray-50">
                            <Disclosure.Button className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-100 rounded-[16px] transition-colors">
                              <span className="text-[15px] font-semibold text-gray-900 drop-shadow-sm">
                                Shop
                              </span>
                              <ChevronRight
                                size={20}
                                className={clx(
                                  "transition-transform duration-150 text-gray-500",
                                  disclosureOpen ? "rotate-90" : ""
                                )}
                              />
                            </Disclosure.Button>
                            <Disclosure.Panel className="px-5 pb-5">
                              <div className="flex flex-col gap-y-3 text-[13px] text-gray-600">
                                {shopCategoryLinks.length ? (
                                  <>
                                    <div className="pt-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                      Categories
                                    </div>
                                    {shopCategoryLinks.map((item) => {
                                      const Icon = iconForCategory(item.name)

                                      return (
                                        <LocalizedClientLink
                                          key={item.href}
                                          href={item.href}
                                          className="flex items-center gap-2 py-1 hover:text-gray-900"
                                          onClick={close}
                                        >
                                          <span className="shrink-0 text-gray-400">
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
                                    <div className="pt-4 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                      Collections
                                    </div>
                                    <div className="mt-2 -mx-5 px-5">
                                      <div className="flex gap-3 overflow-x-auto py-2">
                                        {shopCollectionLinks.map((item) => (
                                          <LocalizedClientLink
                                            key={item.href}
                                            href={item.href}
                                            className="shrink-0 rounded-full border border-gray-200 px-3 py-1 text-[13px] text-gray-800 bg-white"
                                            onClick={close}
                                          >
                                            {item.name}
                                          </LocalizedClientLink>
                                        ))}
                                      </div>
                                    </div>
                                  </>
                                ) : null}

                              </div>
                            </Disclosure.Panel>
                          </div>
                        )}
                      </Disclosure>

                      <Disclosure>
                        {({ open: disclosureOpen }) => (
                          <div className="rounded-[16px] border border-gray-200 bg-gray-50">
                            <Disclosure.Button className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-100 rounded-[16px] transition-colors">
                              <span className="text-[15px] font-semibold text-gray-900 drop-shadow-sm">
                                Products
                              </span>
                              <ChevronRight
                                size={20}
                                className={clx(
                                  "transition-transform duration-150 text-gray-500",
                                  disclosureOpen ? "rotate-90" : ""
                                )}
                              />
                            </Disclosure.Button>
                            <Disclosure.Panel className="px-5 pb-5">
                              <div className="flex flex-col gap-y-3 text-[13px] text-gray-600">
                                {trendingLinks.map((item) => (
                                  <LocalizedClientLink
                                    key={item.href}
                                    href={item.href}
                                    className="py-1 hover:text-gray-900"
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
                      <div className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">
                        Quick links
                      </div>
                      <ul className="mt-4 flex flex-col gap-y-3">
                        {PRIMARY_LINKS.map((item) => (
                          <li key={item.name}>
                            <LocalizedClientLink
                              href={item.href}
                              className="block py-1 text-[14px] font-medium text-gray-900 hover:text-gray-600"
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

                  <div className="border-t border-gray-200 px-6 py-5">
                    <div className="w-full flex items-center justify-between">
                      {regions && (
                        <CountrySelect
                          toggleState={toggleState}
                          regions={regions}
                        />
                      )}
                      <ChevronRight
                        size={20}
                        className={clx(
                          "transition-transform duration-150 text-gray-500",
                          toggleState.state ? "rotate-90" : ""
                        )}
                      />
                    </div>

                    <Text className="mt-5 flex justify-between txt-compact-small text-gray-400">
                      © {new Date().getFullYear()} Letscase. All rights
                      reserved.
                    </Text>
                  </div>
                </div>
              </div>
            </>,
            document.body
          )}
      </div>
    </div>
  )
}

export default SideMenu
