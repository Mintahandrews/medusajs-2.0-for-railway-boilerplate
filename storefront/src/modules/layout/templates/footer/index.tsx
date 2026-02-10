import { Text, clx } from "@medusajs/ui"
import { ArrowUp, Instagram } from "lucide-react"
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
                href="https://www.instagram.com/letscase_gh?igsh=dXVkYW5wOGdsbmp5&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-grey-5 border border-grey-20 flex items-center justify-center text-grey-90 hover:bg-brand hover:border-brand hover:text-white transition"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.snapchat.com/add/letscase_gh?share_id=g2ZEOZ72RmKzorDeW66Ymg&locale=en_AE"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-grey-5 border border-grey-20 flex items-center justify-center text-grey-90 hover:bg-brand hover:border-brand hover:text-white transition"
                aria-label="Snapchat"
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M15.943 11.526c-.111-.303-.323-.465-.564-.599a1 1 0 0 0-.123-.064l-.219-.111c-.752-.399-1.339-.902-1.746-1.498a3.4 3.4 0 0 1-.3-.531c-.034-.1-.032-.156-.008-.207a.3.3 0 0 1 .097-.1c.129-.086.262-.173.352-.231.162-.104.289-.187.371-.245.309-.216.525-.446.66-.702a1.4 1.4 0 0 0 .069-1.16c-.205-.538-.713-.872-1.329-.872a1.8 1.8 0 0 0-.487.065c.006-.368-.002-.757-.035-1.139-.116-1.344-.587-2.048-1.077-2.61a4.3 4.3 0 0 0-1.095-.881C9.764.216 8.92 0 7.999 0s-1.76.216-2.505.641c-.412.232-.782.53-1.097.883-.49.562-.96 1.267-1.077 2.61-.033.382-.04.772-.036 1.138a1.8 1.8 0 0 0-.487-.065c-.615 0-1.124.335-1.328.873a1.4 1.4 0 0 0 .067 1.161c.136.256.352.486.66.701.082.058.21.14.371.246l.339.221a.4.4 0 0 1 .109.11c.026.053.027.11-.012.217a3.4 3.4 0 0 1-.295.52c-.398.583-.968 1.077-1.696 1.472-.385.204-.786.34-.955.8-.128.348-.044.743.28 1.075q.18.189.409.31a4.4 4.4 0 0 0 1 .4.7.7 0 0 1 .202.09c.118.104.102.26.259.488q.12.178.296.3c.33.229.701.243 1.095.258.355.014.758.03 1.217.18.19.064.389.186.618.328.55.338 1.305.802 2.566.802 1.262 0 2.02-.466 2.576-.806.227-.14.424-.26.609-.321.46-.152.863-.168 1.218-.181.393-.015.764-.03 1.095-.258a1.14 1.14 0 0 0 .336-.368c.114-.192.11-.327.217-.42a.6.6 0 0 1 .19-.087 4.5 4.5 0 0 0 1.014-.404c.16-.087.306-.2.429-.336l.004-.005c.304-.325.38-.709.256-1.047"/></svg>
              </a>
              <a
                href="https://wa.me/233540451001?text=Hi%20Letscase!%20I%20have%20a%20question%20about%20your%20products."
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-grey-5 border border-grey-20 flex items-center justify-center text-grey-90 hover:bg-brand hover:border-brand hover:text-white transition"
                aria-label="WhatsApp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              </a>
              <a
                href="https://www.tiktok.com/@letscase_gh"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-grey-5 border border-grey-20 flex items-center justify-center text-grey-90 hover:bg-brand hover:border-brand hover:text-white transition"
                aria-label="TikTok"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
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

            {/* Telecel Cash — official red brand */}
            <div className="flex items-center gap-2 rounded-lg border border-grey-20 bg-white px-3.5 py-2 shadow-sm">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-label="Telecel Cash">
                <circle cx="12" cy="12" r="12" fill="#E30613" />
                <text x="12" y="15.5" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="11" fill="white">T</text>
              </svg>
              <span className="text-[12px] font-semibold text-[#E30613]">Telecel Cash</span>
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
