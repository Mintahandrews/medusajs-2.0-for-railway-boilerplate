import { Metadata } from "next"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Visit Our Store | Letscase",
  description:
    "Store location and opening hours for Letscase in Accra, Ghana.",
}

export default function VisitOurStorePage() {
  return (
    <div className="mx-auto max-w-[900px] px-5 small:px-10 py-16">
      <h1 className="text-[32px] font-bold text-grey-90">Visit Our Store</h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-grey-60">
        Prefer to shop in person? Visit our store in Accra. Update the details below with
        your exact location and hours.
      </p>

      <div className="mt-10 grid grid-cols-1 small:grid-cols-2 gap-4">
        <section className="rounded-[16px] border border-grey-20 bg-white p-6">
          <h2 className="text-[18px] font-semibold text-grey-90">Address</h2>
          <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
            Letscase — (add street address), Accra, Ghana
          </p>
          <p className="mt-3 text-[13px] text-grey-50">
            Tip: add a Google Maps link once your address is finalized.
          </p>
        </section>

        <section className="rounded-[16px] border border-grey-20 bg-white p-6">
          <h2 className="text-[18px] font-semibold text-grey-90">Opening hours</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[14px] text-grey-60">
            <span className="font-semibold text-grey-90">Mon–Sat</span>
            <span>(add hours)</span>
            <span className="font-semibold text-grey-90">Sunday</span>
            <span>(add hours)</span>
          </div>
        </section>
      </div>

      <div className="mt-6 rounded-[16px] border border-grey-20 bg-white p-6">
        <h2 className="text-[18px] font-semibold text-grey-90">Need directions?</h2>
        <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
          If you’re not sure how to get to us, contact support and we’ll guide you.
        </p>
        <div className="mt-4 flex flex-col small:flex-row gap-3">
          <LocalizedClientLink
            href="/contact"
            className="inline-flex h-11 items-center justify-center rounded-full bg-ui-bg-interactive px-6 text-white text-[14px] font-semibold hover:bg-ui-bg-interactive-hover transition"
          >
            Contact us
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/store"
            className="inline-flex h-11 items-center justify-center rounded-full border border-grey-20 bg-white px-6 text-[14px] font-semibold text-grey-90 hover:border-ui-border-interactive hover:text-ui-fg-interactive transition"
          >
            Shop online
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
