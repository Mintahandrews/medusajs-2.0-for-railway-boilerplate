import { Metadata } from "next"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Our Story | Letscase",
}

export default function OurStoryPage() {
  return (
    <div className="mx-auto max-w-[900px] px-5 small:px-10 py-16">
      <h1 className="text-[32px] font-bold text-grey-90">Our Story</h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-grey-60">
        Letscase is a premium electronics and mobile accessories retailer based in
        Accra, Ghana.
      </p>

      <div className="mt-10 space-y-8">
        <section className="rounded-[16px] border border-grey-20 bg-white p-6">
          <h2 className="text-[18px] font-semibold text-grey-90">Why we started</h2>
          <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
            We created Letscase to make it easy to find accessories that actually fit —
            and last. We focus on reliable quality, clear product information, and support
            that helps you choose confidently.
          </p>
        </section>

        <section className="rounded-[16px] border border-grey-20 bg-white p-6">
          <h2 className="text-[18px] font-semibold text-grey-90">What we believe</h2>
          <ul className="mt-3 grid grid-cols-1 small:grid-cols-3 gap-3 text-[14px] text-grey-60">
            <li className="rounded-[14px] border border-grey-20 bg-white px-4 py-3">
              <p className="font-semibold text-grey-90">Compatibility</p>
              <p className="mt-1">Accessories that match your device.</p>
            </li>
            <li className="rounded-[14px] border border-grey-20 bg-white px-4 py-3">
              <p className="font-semibold text-grey-90">Durability</p>
              <p className="mt-1">Built for daily use and longevity.</p>
            </li>
            <li className="rounded-[14px] border border-grey-20 bg-white px-4 py-3">
              <p className="font-semibold text-grey-90">Support</p>
              <p className="mt-1">Helpful answers, fast resolutions.</p>
            </li>
          </ul>
        </section>

        <section className="rounded-[16px] border border-grey-20 bg-white p-6">
          <h2 className="text-[18px] font-semibold text-grey-90">Explore</h2>
          <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
            See what’s new or shop the full catalog.
          </p>
          <div className="mt-4 flex flex-col small:flex-row gap-3">
            <LocalizedClientLink
              href="/new-arrivals"
              className="inline-flex h-11 items-center justify-center rounded-full bg-ui-bg-interactive px-6 text-white text-[14px] font-semibold hover:bg-ui-bg-interactive-hover transition"
            >
              New arrivals
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/store"
              className="inline-flex h-11 items-center justify-center rounded-full border border-grey-20 bg-white px-6 text-[14px] font-semibold text-grey-90 hover:border-ui-border-interactive hover:text-ui-fg-interactive transition"
            >
              Shop all
            </LocalizedClientLink>
          </div>
        </section>
      </div>
    </div>
  )
}
