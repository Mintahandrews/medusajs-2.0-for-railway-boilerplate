import { Metadata } from "next"
import { notFound } from "next/navigation"

import Wrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { enrichLineItems, retrieveCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { getCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Checkout",
}

const fetchCart = async () => {
  try {
    const cart = await retrieveCart()
    if (!cart) {
      return null
    }

    if (cart?.items?.length) {
      const enrichedItems = await enrichLineItems(cart?.items, cart?.region_id!)
      cart.items = enrichedItems as HttpTypes.StoreCartLineItem[]
    }

    return cart
  } catch (error) {
    console.error("Error fetching cart:", error)
    return null
  }
}

export default async function Checkout() {
  const cart = await fetchCart()
  
  if (!cart) {
    return notFound()
  }

  const customer = await getCustomer().catch(() => null)

  return (
    <div className="content-container py-6 small:py-12">
      <div className="grid grid-cols-1 small:grid-cols-[minmax(0,1fr)_416px] gap-y-10 small:gap-y-0 small:gap-x-16">
        <Wrapper cart={cart}>
          <CheckoutForm cart={cart} customer={customer} />
        </Wrapper>
        <CheckoutSummary cart={cart} />
      </div>
    </div>
  )
}
