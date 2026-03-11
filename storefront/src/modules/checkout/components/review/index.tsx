"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Heading, Text, clx } from "@medusajs/ui"

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
  const hasPendingPaymentSession = Boolean(
    cart?.payment_collection?.payment_sessions?.some(
      (session: any) => session?.status === "pending"
    )
  )
  const canRenderPlaceOrder = paidByGiftcard || hasPendingPaymentSession
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set(name, value)
    return params.toString()
  }

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
      {isOpen && hasAddress && hasShippingMethod && (
        <>
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
            <div className="flex flex-col items-start gap-3">
              <Text className="text-sm text-ui-fg-subtle">
                Payment session is not active yet. Choose Paystack and continue again to initialize payment.
              </Text>
              <button
                onClick={() =>
                  router.push(pathname + "?" + createQueryString("step", "payment"), {
                    scroll: false,
                  })
                }
                className="px-4 py-2 rounded-md bg-black text-white text-sm font-medium"
                data-testid="go-to-payment-button"
              >
                Back to payment
              </button>
            </div>
          )}
        </>
      )}
      {isOpen && (!hasAddress || !hasShippingMethod) && (
        <div className="flex flex-col items-start gap-3">
          <Text className="text-sm text-ui-fg-subtle">
            Complete delivery information before reviewing payment.
          </Text>
          <button
            onClick={() =>
              router.push(pathname + "?" + createQueryString("step", "address"), {
                scroll: false,
              })
            }
            className="px-4 py-2 rounded-md bg-black text-white text-sm font-medium"
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
