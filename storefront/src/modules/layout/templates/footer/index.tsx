import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  return (
    <footer className="border-t border-grey-20 w-full bg-white">
      <div className="mx-auto max-w-[1440px] px-5 small:px-10">
        <div className="py-14 small:py-16 grid grid-cols-1 small:grid-cols-4 gap-10 small:gap-12">
          <div>
            <LocalizedClientLink href="/" className="inline-block">
              <span className="text-[18px] font-bold text-grey-90">Letscase</span>
            </LocalizedClientLink>
            <p className="mt-4 text-[14px] text-grey-50 leading-[1.6] max-w-[280px]">
              We provide top-quality mobile and computer accessories designed for
              performance, durability, and convenience.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[
                { label: "Facebook", href: "https://facebook.com" },
                { label: "Instagram", href: "https://instagram.com" },
                { label: "X", href: "https://x.com" },
                { label: "YouTube", href: "https://youtube.com" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-grey-5 border border-grey-20 flex items-center justify-center text-grey-90 hover:bg-brand hover:border-brand hover:text-white transition"
                >
                  <span className="text-[12px] font-semibold">
                    {s.label === "Instagram" ? "IG" : s.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[16px] font-semibold text-grey-90 mb-5">
              Quick Links
            </div>
            <ul className="space-y-2 text-[14px] text-grey-50">
              {[
                { label: "Shop All", href: "/store" },
                { label: "Best Sellers", href: "/best-sellers" },
                { label: "New Arrivals", href: "/new-arrivals" },
                { label: "Wishlist", href: "/account/wishlist" },
                { label: "Deals", href: "/store?onSale=1" },
                { label: "About", href: "/about-us" },
              ].map((l) => (
                <li key={l.label}>
                  <LocalizedClientLink
                    href={l.href}
                    className="hover:text-brand transition"
                  >
                    {l.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[16px] font-semibold text-grey-90 mb-5">
              Support
            </div>
            <ul className="space-y-2 text-[14px] text-grey-50">
              {[
                { label: "Order Tracking", href: "/account/orders" },
                { label: "Returns & Refunds", href: "/returns-and-refunds" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms & Conditions", href: "/terms-and-conditions" },
                { label: "Account", href: "/account" },
                { label: "FAQ", href: "/faq" },
                { label: "Contact", href: "/contact" },
              ].map((l) => (
                <li key={l.label}>
                  <LocalizedClientLink
                    href={l.href}
                    className="hover:text-brand transition"
                  >
                    {l.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[16px] font-semibold text-grey-90 mb-5">
              Company
            </div>
            <ul className="space-y-2 text-[14px] text-grey-50">
              {[
                { label: "Our Story", href: "/our-story" },
                { label: "Visit Our Store", href: "/visit-our-store" },
                { label: "Contact Us", href: "/contact" },
              ].map((l) => (
                <li key={l.label}>
                  <LocalizedClientLink
                    href={l.href}
                    className="hover:text-brand transition"
                  >
                    {l.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-grey-20 py-6 flex flex-col small:flex-row items-center justify-between gap-4">
          <div className="text-[14px] text-grey-50">
            © {new Date().getFullYear()} Letscase. All rights reserved.
          </div>
          <a
            href="#top"
            className="h-11 w-11 rounded-full bg-grey-5 border border-grey-20 flex items-center justify-center text-grey-90 hover:bg-black hover:text-white transition"
            aria-label="Back to top"
          >
            ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
