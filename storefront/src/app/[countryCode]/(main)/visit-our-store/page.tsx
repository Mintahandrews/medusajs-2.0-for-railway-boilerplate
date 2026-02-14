import { Metadata } from "next"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Visit Our Store | Letscase",
  description:
    "Store location and opening hours for Letscase in Accra, Ghana.",
}

const googleMapsEmbedUrl =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.6161134517747!2d-0.23719872501435255!3d5.623555394357509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9906b301a3a7%3A0xc6f701e84e2fd85!2sLetsCase%20Gh!5e0!3m2!1sen!2sgh!4v1767737757252!5m2!1sen!2sgh"

const googleMapsDirectionsUrl =
  "https://www.google.com/maps/dir/?api=1&destination=LetsCase+Gh"

export default function VisitOurStorePage() {
  return (
    <div className="mx-auto max-w-[960px] px-5 small:px-10 py-16">
      {/* Hero */}
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 rounded-full bg-brand/10 text-brand text-[12px] font-semibold uppercase tracking-wider mb-4">
          Visit Us
        </span>
        <h1 className="text-[32px] small:text-[40px] font-bold text-grey-90">
          Visit Our Store
        </h1>
        <p className="mt-3 text-[15px] leading-[1.7] text-grey-50 max-w-[540px] mx-auto">
          Prefer to shop in person? Come see and feel our custom phone cases at
          our store in Accra. Walk-ins are always welcome!
        </p>
      </div>

      {/* Map */}
      <div className="rounded-[20px] overflow-hidden border border-grey-20 bg-grey-10 mb-8">
        <iframe
          src={googleMapsEmbedUrl}
          width="100%"
          height="350"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Letscase Store Location"
        />
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 small:grid-cols-3 gap-4 mb-8">
        {/* Address */}
        <section className="rounded-[16px] border border-grey-20 bg-white p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-brand text-lg" aria-hidden="true">
              📍
            </span>
            <h2 className="text-[17px] font-semibold text-grey-90">Address</h2>
          </div>
          <p className="text-[14px] leading-[1.7] text-grey-60">
            E123 Prince Okai St
            <br />
            Accra, Ghana
            <br />
            <span className="text-grey-40 text-[13px]">JQF8+C5 Accra</span>
          </p>
        </section>

        {/* Opening Hours */}
        <section className="rounded-[16px] border border-grey-20 bg-white p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-brand text-lg" aria-hidden="true">
              🕗
            </span>
            <h2 className="text-[17px] font-semibold text-grey-90">
              Opening Hours
            </h2>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[14px] text-grey-60">
            <span className="font-semibold text-grey-90">Mon – Sat</span>
            <span>8:00 AM – 8:00 PM</span>
            <span className="font-semibold text-grey-90">Sunday</span>
            <span>Closed</span>
          </div>
        </section>

        {/* Contact */}
        <section className="rounded-[16px] border border-grey-20 bg-white p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-brand text-lg" aria-hidden="true">
              📞
            </span>
            <h2 className="text-[17px] font-semibold text-grey-90">Contact</h2>
          </div>
          <p className="text-[14px] leading-[1.7] text-grey-60">
            Phone:{" "}
            <a href="tel:+233540451001" className="underline hover:text-brand">
              054 045 1001
            </a>
            <br />
            WhatsApp:{" "}
            <a
              href="https://wa.me/233540451001"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-brand"
            >
              054 045 1001
            </a>
          </p>
        </section>
      </div>

      {/* Action buttons */}
      <div className="rounded-[16px] border border-grey-20 bg-white p-6">
        <h2 className="text-[18px] font-semibold text-grey-90 mb-2">
          Need directions?
        </h2>
        <p className="text-[14px] leading-[1.7] text-grey-60 mb-5">
          Open Google Maps for turn-by-turn directions to our store, or browse
          our online shop from anywhere.
        </p>
        <div className="flex flex-col small:flex-row gap-3">
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-white text-[14px] font-semibold hover:bg-brand-dark transition gap-2"
          >
            🧭 Get Directions
          </a>
          <LocalizedClientLink
            href="/contact"
            className="inline-flex h-11 items-center justify-center rounded-full border border-grey-20 bg-white px-6 text-[14px] font-semibold text-grey-90 hover:border-brand hover:text-brand transition"
          >
            Contact Us
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/store"
            className="inline-flex h-11 items-center justify-center rounded-full border border-grey-20 bg-white px-6 text-[14px] font-semibold text-grey-90 hover:border-brand hover:text-brand transition"
          >
            Shop Online
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
