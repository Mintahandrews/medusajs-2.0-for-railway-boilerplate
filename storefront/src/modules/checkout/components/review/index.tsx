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

  const baseStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    true
  const hasPaymentContext = Boolean(cart.payment_collection || paidByGiftcard)
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
      {isOpen && baseStepsCompleted && (
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
          {hasPaymentContext ? (
            <PaymentButton cart={cart} data-testid="submit-order-button" />
          ) : (
            <button
              onClick={() =>
                router.push(pathname + "?" + createQueryString("step", "payment"), {
                  scroll: false,
                })
              }
              className="px-4 py-2 rounded-md bg-black text-white text-sm font-medium"
              data-testid="go-to-payment-button"
            >
              Select payment method first
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default Review
