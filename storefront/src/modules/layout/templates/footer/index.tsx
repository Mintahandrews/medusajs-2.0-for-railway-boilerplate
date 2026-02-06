import { Text, clx } from "@medusajs/ui"
import { ArrowUp, Facebook, Instagram, Twitter, Youtube, MessageCircle } from "lucide-react"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  return (
    <footer className="border-t border-grey-20 w-full bg-white">
      <div className="mx-auto max-w-[1440px] px-5 small:px-10">
        <div className="py-14 small:py-16 grid grid-cols-1 small:grid-cols-4 gap-10 small:gap-12">
          <div>
            <LocalizedClientLink href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="Letscase"
                width={160}
                height={40}
                className="h-7 w-auto"
              />
            </LocalizedClientLink>
            <p className="mt-4 text-[14px] text-grey-50 leading-[1.6] max-w-[280px]">
              We provide top-quality mobile and computer accessories designed for
              performance, durability, and convenience.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-grey-5 border border-grey-20 flex items-center justify-center text-grey-90 hover:bg-brand hover:border-brand hover:text-white transition"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-grey-5 border border-grey-20 flex items-center justify-center text-grey-90 hover:bg-brand hover:border-brand hover:text-white transition"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-grey-5 border border-grey-20 flex items-center justify-center text-grey-90 hover:bg-brand hover:border-brand hover:text-white transition"
                aria-label="X (Twitter)"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-grey-5 border border-grey-20 flex items-center justify-center text-grey-90 hover:bg-brand hover:border-brand hover:text-white transition"
                aria-label="YouTube"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          <div>
            <div className="text-[16px] font-semibold text-grey-90 mb-5">
              Quick Links
            </div>
            <ul className="space-y-2 text-[14px] text-grey-50">
              {[
                { label: "Shop All", href: "/store" },
                { label: "Custom Case", href: "/custom-case" },
                { label: "Best Sellers", href: "/best-sellers" },
                { label: "New Arrivals", href: "/new-arrivals" },
                { label: "Wishlist", href: "/account/wishlist" },
                { label: "Deals", href: "/deals" },
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
                { label: "Order Tracking", href: "/order-tracking" },
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
              <li>
                <a
                  href="https://wa.me/233540451001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-brand transition"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-grey-20 py-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="text-[12px] text-grey-40 uppercase tracking-wider font-medium">We accept</span>

            {/* MTN MoMo — official yellow/blue brand */}
            <div className="flex items-center gap-2 rounded-lg border border-grey-20 bg-white px-3.5 py-2 shadow-sm">
              <svg viewBox="0 0 40 20" className="h-5 w-auto" aria-label="MTN MoMo">
                <rect width="40" height="20" rx="3" fill="#FFCB05" />
                <text x="20" y="13.5" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="10" fill="#003478">MTN</text>
              </svg>
              <span className="text-[12px] font-semibold text-[#003478]">MoMo</span>
            </div>

            {/* Vodafone Cash — official red/white brand */}
            <div className="flex items-center gap-2 rounded-lg border border-grey-20 bg-white px-3.5 py-2 shadow-sm">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-label="Vodafone Cash">
                <circle cx="12" cy="12" r="12" fill="#E60000" />
                <path d="M12 4c-.6 0-1.1.3-1.4.7L7.2 11c-.2.3-.2.7 0 1l3.4 6.3c.3.5.8.7 1.4.7s1.1-.2 1.4-.7l3.4-6.3c.2-.3.2-.7 0-1l-3.4-6.3C13.1 4.3 12.6 4 12 4z" fill="white" />
              </svg>
              <span className="text-[12px] font-semibold text-[#E60000]">Vodafone Cash</span>
            </div>

            {/* Visa — official brand SVG */}
            <div className="flex items-center rounded-lg border border-grey-20 bg-white px-3.5 py-2 shadow-sm">
              <svg viewBox="0 0 780 500" className="h-5 w-auto" aria-label="Visa">
                <rect width="780" height="500" rx="40" fill="#fff" />
                <path d="M293.2 348.7l33.4-195.8h53.4l-33.4 195.8h-53.4zM523.6 158.8c-10.6-4-27.2-8.3-47.9-8.3-52.8 0-90 26.6-90.3 64.6-.3 28.1 26.5 43.8 46.8 53.2 20.8 9.6 27.8 15.7 27.7 24.3-.1 13.1-16.6 19.1-32 19.1-21.3 0-32.7-3-50.2-10.2l-6.9-3.1-7.5 43.8c12.5 5.5 35.5 10.2 59.4 10.5 56.2 0 92.7-26.3 93.1-66.8.2-22.3-14-39.2-44.8-53.2-18.6-9.1-30.1-15.1-30-24.3 0-8.1 9.7-16.8 30.6-16.8 17.4-.3 30.1 3.5 39.9 7.5l4.8 2.3 7.3-42.6zM661.6 152.9h-41.3c-12.8 0-22.4 3.5-28 16.3l-79.4 179.5h56.2s9.2-24.1 11.3-29.4h68.6c1.6 6.9 6.5 29.4 6.5 29.4h49.7l-43.6-195.8zm-65.9 126.3c4.4-11.3 21.5-54.7 21.5-54.7-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47.2 12.5 57.1h-44.7v-.6zM232.8 152.9l-52.3 133.5-5.6-27.2c-9.7-31.2-39.8-65-73.5-81.9l47.9 171.3h56.6l84.2-195.7h-57.3z" fill="#1A1F71" />
                <path d="M124.7 152.9H38.4l-.6 3.7c67.2 16.2 111.7 55.5 130.1 102.6l-18.8-90.2c-3.2-12.4-12.6-15.7-24.4-16.1z" fill="#F9A533" />
              </svg>
            </div>

            {/* Mastercard — official overlapping circles */}
            <div className="flex items-center rounded-lg border border-grey-20 bg-white px-3.5 py-2 shadow-sm">
              <svg viewBox="0 0 152.407 108" className="h-5 w-auto" aria-label="Mastercard">
                <rect width="152.407" height="108" rx="8" fill="#fff" />
                <circle cx="60.412" cy="54" r="38" fill="#EB001B" />
                <circle cx="91.995" cy="54" r="38" fill="#F79E1B" />
                <path d="M76.204 24.793a37.94 37.94 0 0 0-14.192 29.207 37.94 37.94 0 0 0 14.192 29.207A37.94 37.94 0 0 0 90.396 54a37.94 37.94 0 0 0-14.192-29.207z" fill="#FF5F00" />
              </svg>
            </div>

            {/* Paystack — official teal brand */}
            <div className="flex items-center gap-2 rounded-lg border border-grey-20 bg-white px-3.5 py-2 shadow-sm">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-label="Paystack">
                <rect width="24" height="24" rx="4" fill="#00C3F7" />
                <rect x="5" y="5" width="14" height="3" rx="1" fill="white" />
                <rect x="5" y="10.5" width="14" height="3" rx="1" fill="white" />
                <rect x="5" y="16" width="8" height="3" rx="1" fill="white" />
              </svg>
              <span className="text-[12px] font-semibold text-[#011B33]">Paystack</span>
            </div>
          </div>
        </div>
        <div className="border-t border-grey-20 py-6 flex flex-col small:flex-row items-center justify-between gap-4">
          <div className="text-[14px] text-grey-50">
            © {new Date().getFullYear()} Letscase. All rights reserved.
          </div>
          <a
            href="#top"
            className="h-11 w-11 rounded-full bg-grey-5 border border-grey-20 flex items-center justify-center text-grey-90 hover:bg-brand hover:text-white transition"
            aria-label="Back to top"
          >
            <ArrowUp size={18} />
          </a>
        </div>
      </div>
    </footer>
  )
}
