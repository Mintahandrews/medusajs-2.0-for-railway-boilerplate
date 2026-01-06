import { Metadata } from "next"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import StoreLocation from "@modules/home/components/store-location"

export const metadata: Metadata = {
  title: "About Us | Letscase",
}

export default function AboutUsPage() {
  return (
    <>
      <div className="mx-auto max-w-[900px] px-5 small:px-10 py-16">
        <h1 className="text-[32px] font-bold text-grey-90">About Letscase</h1>
        <p className="mt-4 text-[15px] leading-[1.7] text-grey-60">
          Letscase is a premium electronics and mobile accessories retailer based
          in Accra, Ghana. We are passionate about providing high-quality tech 
          accessories that enhance your digital lifestyle.
        </p>

        <div className="mt-10 grid grid-cols-1 small:grid-cols-3 gap-4">
          <div className="rounded-[16px] border border-grey-20 bg-white p-5">
            <h2 className="text-[15px] font-semibold text-grey-90">Curated products</h2>
            <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
              Accessories chosen for compatibility, durability, and everyday performance.
            </p>
          </div>
          <div className="rounded-[16px] border border-grey-20 bg-white p-5">
            <h2 className="text-[15px] font-semibold text-grey-90">Trusted support</h2>
            <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
              Need help deciding? We'll recommend what fits your device.
            </p>
          </div>
          <div className="rounded-[16px] border border-grey-20 bg-white p-5">
            <h2 className="text-[15px] font-semibold text-grey-90">Fast delivery</h2>
            <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
              Quick dispatch and order tracking from your account.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-[16px] border border-grey-20 bg-white p-6">
          <h2 className="text-[18px] font-semibold text-grey-90">Learn more</h2>
          <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
            Want to know how Letscase started, or prefer to shop in person?
          </p>
          <div className="mt-4 flex flex-col small:flex-row gap-3">
            <LocalizedClientLink
              href="/our-story"
              className="inline-flex h-11 items-center justify-center rounded-full border border-grey-20 bg-white px-6 text-[14px] font-semibold text-grey-90 hover:border-brand hover:text-brand transition"
            >
              Our story
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/visit-our-store"
              className="inline-flex h-11 items-center justify-center rounded-full bg-brand px-6 text-white text-[14px] font-semibold hover:bg-brand-dark transition"
            >
              Visit our store
            </LocalizedClientLink>
          </div>
        </div>
      </div>

      {/* Store Location Map & Info */}
      <StoreLocation />
    </>
  )
}
