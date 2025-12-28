"use client"

import { Button, Heading } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  return (
    <div className="flex flex-col gap-y-6">
      <Heading level="h2" className="text-[1.5rem] font-bold">
        Order Summary
      </Heading>

      <div className="flex flex-col gap-y-4">
        <DiscountCode cart={cart} />

        <div className="flex flex-col gap-y-2">
          <span className="text-sm text-gray-700">Your bonus card number</span>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Card Number"
              className="flex-1 border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
            <button className="px-6 py-2 border border-black rounded-md text-sm font-medium hover:bg-gray-50">
              Apply
            </button>
          </div>
        </div>
      </div>

      <CartTotals totals={cart} />

      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
      >
        <Button className="w-full h-14 bg-black text-white hover:bg-gray-800 rounded-lg font-medium text-base">Checkout</Button>
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
