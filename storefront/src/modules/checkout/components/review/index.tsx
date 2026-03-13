"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Heading, Text, clx } from "@medusajs/ui"
import { isPaystack, paymentInfoMap } from "@lib/constants"
import { convertToLocale } from "@lib/util/money"
import PaymentButton from "../payment-button"

const Review = ({ cart }: { cart: any }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const hasAddress = Boolean(cart?.shipping_address)
  const hasShippingMethod = Boolean((cart?.shipping_methods?.length ?? 0) > 0)
  const activeSession = cart?.payment_collection?.payment_sessions?.find(
    (session: any) => session?.status === "pending"
  )
  const hasPendingPaymentSession = Boolean(activeSession)
  const canRenderPlaceOrder = paidByGiftcard || hasPendingPaymentSession

  // Derive a readable payment method summary
  const providerId = activeSession?.provider_id ?? ""
  const paystackChannels = Array.isArray(activeSession?.data?.channels)
    ? (activeSession.data.channels as string[])
    : []
  const channelLabels: Record<string, string> = {
    mobile_money: "Mobile Money",
    card: "Card Payment",
  }
  const paymentMethodLabel = isPaystack(providerId)
    ? paystackChannels[0]
      ? `Paystack — ${channelLabels[paystackChannels[0]] ?? paystackChannels[0]}`
      : "Paystack"
    : paymentInfoMap[providerId]?.title || providerId

  const formattedTotal =
    cart?.total != null && cart?.currency_code
      ? convertToLocale({
          amount: cart.total,
          currency_code: cart.currency_code,
        })
      : null

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set(name, value)
    return params.toString()
  }

  // Auto-redirect to payment step if we land on review with no active session
  useEffect(() => {
    if (isOpen && hasAddress && hasShippingMethod && !canRenderPlaceOrder) {
      const timer = setTimeout(() => {
        router.push(pathname + "?" + createQueryString("step", "payment"), {
          scroll: false,
        })
      }, 2500)
      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, hasAddress, hasShippingMethod, canRenderPlaceOrder])

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          Review
        </Heading>
      </div>
      {isOpen && hasAddress && (
        <>
          {/* Order summary row */}
          {(hasPendingPaymentSession || formattedTotal) && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-ui-border-base bg-ui-bg-subtle px-5 py-4 mb-6">
              {paymentMethodLabel && (
                <div className="flex flex-col">
                  <span className="text-xs text-ui-fg-muted mb-0.5">
                    Payment method
                  </span>
                  <span className="text-sm font-medium text-ui-fg-base">
                    {paymentMethodLabel}
                  </span>
                </div>
              )}
              {formattedTotal && (
                <div className="flex flex-col sm:text-right">
                  <span className="text-xs text-ui-fg-muted mb-0.5">Total</span>
                  <span className="text-base font-semibold text-ui-fg-base">
                    {formattedTotal}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                By clicking the Place Order button, you confirm that you have
                read, understand and accept our Terms of Use, Terms of Sale and
                Returns Policy and acknowledge that you have read
                Letscase&apos;s Privacy Policy.
              </Text>
            </div>
          </div>

          {canRenderPlaceOrder ? (
            <PaymentButton cart={cart} data-testid="submit-order-button" />
          ) : (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
              <Text className="text-sm text-amber-800">
                No active payment session found. Redirecting you back to select
                a payment method…
              </Text>
              <button
                onClick={() =>
                  router.push(
                    pathname + "?" + createQueryString("step", "payment"),
                    { scroll: false }
                  )
                }
                className="px-4 py-2 rounded-lg bg-amber-700 text-white text-sm font-medium hover:bg-amber-800 transition-colors"
                data-testid="go-to-payment-button"
              >
                Back to payment
              </button>
            </div>
          )}
        </>
      )}
      {isOpen && !hasAddress && (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-ui-border-base bg-ui-bg-subtle px-5 py-4">
          <Text className="text-sm text-ui-fg-subtle">
            Please complete your delivery information before placing an order.
          </Text>
          <button
            onClick={() =>
              router.push(
                pathname + "?" + createQueryString("step", "address"),
                { scroll: false }
              )
            }
            className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium"
            data-testid="go-to-address-button"
          >
            Back to address
          </button>
        </div>
      )}
    </div>
  )
}

export default Review
