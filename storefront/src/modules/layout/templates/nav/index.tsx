import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container flex items-center justify-between w-full h-full text-small-regular py-4">
          {/* Left: Brand */}
          <div className="flex items-center">
            <div className="h-full flex items-center medium:hidden mr-4">
              <SideMenu regions={regions} />
            </div>
            <LocalizedClientLink
              href="/"
              className="text-2xl font-bold text-[#0d9488] hover:opacity-80 transition-opacity"
              data-testid="nav-store-link"
            >
              Letscase
            </LocalizedClientLink>
          </div>

          {/* Center: Search */}
          <div className="hidden medium:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <input
                type="search"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 bg-white"
              />
            </div>
          </div>

          {/* Right: Navigation Links & Icons */}
          <div className="flex items-center gap-x-6 h-full justify-end">
            <div className="hidden medium:flex items-center gap-x-8 mr-6">
              <LocalizedClientLink href="/" className="text-gray-600 hover:text-black font-medium">Home</LocalizedClientLink>
              <LocalizedClientLink href="/about" className="text-gray-600 hover:text-black font-medium">About</LocalizedClientLink>
              <LocalizedClientLink href="/contact" className="text-gray-600 hover:text-black font-medium">Contact Us</LocalizedClientLink>
            </div>

            <div className="flex items-center gap-x-6">
              <LocalizedClientLink className="text-gray-700 hover:text-[#0d9488]" href="/account/favorites">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </LocalizedClientLink>

              <Suspense
                fallback={
                  <LocalizedClientLink
                    className="text-gray-700 hover:text-[#0d9488]"
                    href="/cart"
                    data-testid="nav-cart-link"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                  </LocalizedClientLink>
                }
              >
                <CartButton />
              </Suspense>

              <LocalizedClientLink
                className="text-gray-700 hover:text-[#0d9488]"
                href="/account"
                data-testid="nav-account-link"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </LocalizedClientLink>
            </div>
          </div>
        </nav>
      </header>
    </div>
  )
}
