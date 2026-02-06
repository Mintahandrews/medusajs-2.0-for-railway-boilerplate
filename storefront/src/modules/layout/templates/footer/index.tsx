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
          <div className="flex flex-wrap items-center justify-center gap-5">
            <span className="text-[12px] text-grey-40 uppercase tracking-wider font-medium">We accept</span>
            {/* MTN MoMo */}
            <div className="flex items-center gap-1.5 rounded-md border border-grey-20 bg-grey-5 px-3 py-1.5">
              <div className="h-5 w-5 rounded-full bg-[#FFC300] flex items-center justify-center">
                <span className="text-[8px] font-bold text-grey-90">MTN</span>
              </div>
              <span className="text-[11px] font-medium text-grey-60">MoMo</span>
            </div>
            {/* Vodafone Cash */}
            <div className="flex items-center gap-1.5 rounded-md border border-grey-20 bg-grey-5 px-3 py-1.5">
              <div className="h-5 w-5 rounded-full bg-[#E60000] flex items-center justify-center">
                <span className="text-[7px] font-bold text-white">V</span>
              </div>
              <span className="text-[11px] font-medium text-grey-60">Vodafone Cash</span>
            </div>
            {/* Visa */}
            <div className="flex items-center rounded-md border border-grey-20 bg-grey-5 px-3 py-1.5">
              <svg viewBox="0 0 48 16" className="h-4 w-auto" aria-label="Visa">
                <path d="M19.5 1.3l-3.2 13.4h-2.6l3.2-13.4h2.6zm13.1 8.7l1.4-3.7.8 3.7h-2.2zm2.9 4.7h2.4l-2.1-13.4h-2.2c-.5 0-.9.3-1.1.7l-3.8 12.7h2.7l.5-1.4h3.3l.3 1.4zm-6.5-4.4c0-3.5-4.9-3.7-4.9-5.3 0-.5.5-1 1.5-1.1.5-.1 1.9-.1 3.5.6l.6-2.9A9.5 9.5 0 0 0 26.3.8c-2.5 0-4.3 1.3-4.3 3.3 0 1.4 1.3 2.2 2.3 2.7 1 .5 1.4.8 1.4 1.3 0 .7-.8 1-1.6 1-1.3 0-2.1-.4-2.7-.6l-.5 2.9c.6.3 1.8.5 3 .5 2.7 0 4.4-1.3 4.4-3.3zM15 1.3l-4.2 13.4H8.1L5.9 4.5c-.1-.5-.3-.7-.7-.9C4.3 3.2 3 2.8 1.8 2.5l.1-.2H6c.6 0 1.1.4 1.2 1.1l1 5.5 2.6-6.6H15z" fill="#1A1F71" />
              </svg>
            </div>
            {/* Mastercard */}
            <div className="flex items-center rounded-md border border-grey-20 bg-grey-5 px-3 py-1.5">
              <svg viewBox="0 0 48 30" className="h-5 w-auto" aria-label="Mastercard">
                <circle cx="18" cy="15" r="12" fill="#EB001B" />
                <circle cx="30" cy="15" r="12" fill="#F79E1B" />
                <path d="M24 5.6a12 12 0 0 0-4.4 9.4 12 12 0 0 0 4.4 9.4 12 12 0 0 0 4.4-9.4A12 12 0 0 0 24 5.6z" fill="#FF5F00" />
              </svg>
            </div>
            {/* Paystack */}
            <div className="flex items-center gap-1.5 rounded-md border border-grey-20 bg-grey-5 px-3 py-1.5">
              <div className="h-4 w-4 rounded bg-[#00C3F7] flex items-center justify-center">
                <span className="text-[7px] font-bold text-white">P</span>
              </div>
              <span className="text-[11px] font-medium text-grey-60">Paystack</span>
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
