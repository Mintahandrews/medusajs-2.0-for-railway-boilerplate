

import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Category data organized by groups
const categoryGroups = {
  phones: {
    title: "Phones",
    items: [
      { name: "iPhones", handle: "iphones" },
      { name: "Android Phones", handle: "android-phones" },
    ],
  },
  computers: {
    title: "Computers",
    items: [
      { name: "Laptops", handle: "laptops" },
      { name: "Laptop Bags", handle: "laptop-bags" },
    ],
  },
  cases: {
    title: "Cases & Protection",
    items: [
      { name: "Phone Cases", handle: "phone-cases" },
      { name: "MacBook Cases", handle: "macbook-cases" },
      { name: "iPad Cases", handle: "ipad-cases" },
      { name: "AirPod Cases", handle: "airpod-cases" },
      { name: "Charger Protectors", handle: "charger-protectors" },
      { name: "Screen Protectors", handle: "screen-protectors" },
    ],
  },
  accessories: {
    title: "Accessories",
    items: [
      { name: "Gadget Stands", handle: "gadget-stands" },
      { name: "Phone Chargers", handle: "phone-chargers" },
      { name: "Car Chargers", handle: "car-chargers" },
      { name: "Speakers", handle: "speakers" },
      { name: "Earphones & Buds", handle: "earphones-buds" },
    ],
  },
}

export default async function Footer() {
  return (
    <footer className="border-t border-ui-border-base w-full bg-gray-50">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-8 xsmall:flex-row items-start justify-between py-16">
          {/* Logo and Brand */}
          <div className="flex flex-col gap-y-4">
            <LocalizedClientLink
              href="/"
              className="flex items-center"
            >
              <img src="/LetsCase LOGO.png" alt="Letscase" className="h-12 w-auto" />
            </LocalizedClientLink>
            <p className="text-ui-fg-subtle txt-small max-w-xs">
              Premium tech accessories for your devices. Quality cases, chargers, and gadgets.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="text-small-regular gap-8 md:gap-x-12 grid grid-cols-2 sm:grid-cols-4">
            {/* Phones */}
            <div className="flex flex-col gap-y-3">
              <span className="txt-small-plus txt-ui-fg-base font-semibold">
                {categoryGroups.phones.title}
              </span>
              <ul className="grid grid-cols-1 gap-2" data-testid="footer-phones">
                {categoryGroups.phones.items.map((item) => (
                  <li key={item.handle}>
                    <LocalizedClientLink
                      className="text-ui-fg-subtle txt-small hover:text-ui-fg-base transition-colors"
                      href={`/categories/${item.handle}`}
                    >
                      {item.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cases & Protection */}
            <div className="flex flex-col gap-y-3">
              <span className="txt-small-plus txt-ui-fg-base font-semibold">
                {categoryGroups.cases.title}
              </span>
              <ul className="grid grid-cols-1 gap-2" data-testid="footer-cases">
                {categoryGroups.cases.items.map((item) => (
                  <li key={item.handle}>
                    <LocalizedClientLink
                      className="text-ui-fg-subtle txt-small hover:text-ui-fg-base transition-colors"
                      href={`/categories/${item.handle}`}
                    >
                      {item.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Accessories */}
            <div className="flex flex-col gap-y-3">
              <span className="txt-small-plus txt-ui-fg-base font-semibold">
                {categoryGroups.accessories.title}
              </span>
              <ul className="grid grid-cols-1 gap-2" data-testid="footer-accessories">
                {categoryGroups.accessories.items.map((item) => (
                  <li key={item.handle}>
                    <LocalizedClientLink
                      className="text-ui-fg-subtle txt-small hover:text-ui-fg-base transition-colors"
                      href={`/categories/${item.handle}`}
                    >
                      {item.name}
                    </LocalizedClientLink>
                  </li>
                ))}
                {categoryGroups.computers.items.map((item) => (
                  <li key={item.handle}>
                    <LocalizedClientLink
                      className="text-ui-fg-subtle txt-small hover:text-ui-fg-base transition-colors"
                      href={`/categories/${item.handle}`}
                    >
                      {item.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Info */}
            <div className="flex flex-col gap-y-3">
              <span className="txt-small-plus txt-ui-fg-base font-semibold">Letscase</span>
              <ul className="grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small">
                <li>
                  <LocalizedClientLink
                    href="/about"
                    className="hover:text-ui-fg-base transition-colors"
                  >
                    About Us
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/contact"
                    className="hover:text-ui-fg-base transition-colors"
                  >
                    Contact
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/faq"
                    className="hover:text-ui-fg-base transition-colors"
                  >
                    FAQ
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/store"
                    className="hover:text-ui-fg-base transition-colors"
                  >
                    All Products
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row w-full py-6 border-t border-ui-border-base justify-between items-center gap-4 text-ui-fg-muted">
          <span className="txt-compact-small">
            © {new Date().getFullYear()} Letscase. All rights reserved.
          </span>
          <div className="flex gap-4 txt-compact-small">
            <LocalizedClientLink href="/privacy" className="hover:text-ui-fg-base transition-colors">
              Privacy Policy
            </LocalizedClientLink>
            <LocalizedClientLink href="/terms" className="hover:text-ui-fg-base transition-colors">
              Terms of Service
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
