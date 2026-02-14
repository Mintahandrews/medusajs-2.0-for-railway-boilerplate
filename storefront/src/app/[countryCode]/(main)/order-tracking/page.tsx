import { Metadata } from "next"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Order Tracking | Letscase",
  description:
    "Track the status of your order. Sign in to view your full order history and details.",
}

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams?: Promise<{ orderId?: string; email?: string }>
}

export default async function OrderTrackingPage({ searchParams }: Props) {
  const sp = await searchParams
  const orderId = (sp?.orderId || "").trim()
  const email = (sp?.email || "").trim()

  return (
    <div className="mx-auto max-w-[900px] px-5 small:px-10 py-16">
      <h1 className="text-[32px] font-bold text-grey-90">Order Tracking</h1>
      <p className="mt-4 text-[15px] leading-[1.7] text-grey-60">
        To view full order details (items, payment, and delivery updates), please sign in
        to your account.
      </p>

      <div className="mt-8 rounded-[16px] border border-grey-20 bg-white p-6">
        <h2 className="text-[16px] font-semibold text-grey-90">Track with your account</h2>
        <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
          If you placed your order while signed in, you can track it from your Orders page.
        </p>

        <div className="mt-4 flex flex-col small:flex-row gap-3">
          <LocalizedClientLink
            href="/account"
            className="inline-flex h-11 items-center justify-center rounded-full bg-ui-bg-interactive px-6 text-white text-[14px] font-semibold hover:bg-ui-bg-interactive-hover transition"
          >
            Go to account
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/account/orders"
            className="inline-flex h-11 items-center justify-center rounded-full border border-ui-border-interactive px-6 text-[14px] font-semibold text-ui-fg-base hover:bg-grey-5 transition"
          >
            View orders
          </LocalizedClientLink>
        </div>
      </div>

      <div className="mt-10 rounded-[16px] border border-grey-20 bg-white p-6">
        <h2 className="text-[16px] font-semibold text-grey-90">Have an Order ID?</h2>
        <p className="mt-2 text-[14px] leading-[1.7] text-grey-60">
          Paste your order ID below to quickly jump to the order details page (you may still
          be asked to sign in).
        </p>

        <form className="mt-4" method="get">
          <div className="grid grid-cols-1 small:grid-cols-[1fr_1fr_auto] gap-3">
            <div>
              <label className="sr-only" htmlFor="orderId">
                Order ID
              </label>
              <input
                id="orderId"
                name="orderId"
                defaultValue={orderId}
                placeholder="Order ID (e.g. order_...)"
                className="h-11 w-full rounded-full border border-grey-20 bg-white px-4 text-[14px] text-grey-90 placeholder:text-grey-40 focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
              />
            </div>

            <div>
              <label className="sr-only" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={email}
                placeholder="Email used at checkout (optional)"
                className="h-11 w-full rounded-full border border-grey-20 bg-white px-4 text-[14px] text-grey-90 placeholder:text-grey-40 focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
              />
            </div>

            <button
              type="submit"
              className="h-11 rounded-full bg-ui-bg-interactive px-6 text-white text-[14px] font-semibold hover:bg-ui-bg-interactive-hover transition"
            >
              Search
            </button>
          </div>
        </form>

        {orderId ? (
          <div className="mt-4 space-y-3">
            <div className="text-[14px] text-grey-60">
              Next step: open your Orders page and search for{" "}
              <span className="font-semibold text-grey-90">{orderId}</span>.
            </div>

            <div className="flex flex-col small:flex-row gap-3">
              <LocalizedClientLink
                href={`/account/orders/details/${encodeURIComponent(orderId)}`}
                className="inline-flex h-11 items-center justify-center rounded-full bg-ui-bg-interactive px-6 text-white text-[14px] font-semibold hover:bg-ui-bg-interactive-hover transition"
              >
                Open order details
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/account/orders"
                className="inline-flex h-11 items-center justify-center rounded-full border border-grey-20 bg-white px-6 text-[14px] font-semibold text-grey-90 hover:border-ui-border-interactive hover:text-ui-fg-interactive transition"
              >
                View all orders
              </LocalizedClientLink>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
