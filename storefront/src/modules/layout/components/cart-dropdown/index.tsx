"use client"

import { Button } from "@medusajs/ui"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { ShoppingBag, X } from "lucide-react"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const open = () => setDrawerOpen(true)
  const close = () => setDrawerOpen(false)

  const totalItems =
    cartState?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const timedOpen = () => {
    open()
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(close, 5000)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const pathname = usePathname()

  // open cart drawer when modifying the cart items, but only if we're not on the cart page
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    itemRef.current = totalItems
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, pathname])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [drawerOpen])

  // Close on Escape
  useEffect(() => {
    if (!drawerOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [drawerOpen])

  return (
    <>
      {/* Cart icon trigger */}
      <button
        type="button"
        onClick={() => {
          if (timerRef.current) clearTimeout(timerRef.current)
          drawerOpen ? close() : open()
        }}
        className="relative inline-flex items-center justify-center text-grey-90 hover:text-brand transition-transform duration-200 hover:scale-110 group"
        data-testid="nav-cart-link"
        aria-label={`Cart (${totalItems})`}
      >
        <ShoppingBag size={22} className="text-grey-90 group-hover:text-brand" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-2 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 font-semibold text-center">
            {totalItems}
          </span>
        )}
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[70] bg-black/50 transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Slide-out drawer */}
      <div
        className={`fixed top-0 right-0 z-[80] h-full w-full small:w-[420px] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        data-testid="nav-cart-dropdown"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-grey-20 px-5 py-4">
            <h3 className="text-[16px] font-semibold text-grey-90">
              Your Cart ({totalItems})
            </h3>
            <button
              type="button"
              onClick={close}
              className="flex h-8 w-8 items-center justify-center rounded-full text-grey-50 hover:bg-grey-5 hover:text-grey-90 transition"
              aria-label="Close cart"
            >
              <X size={18} />
            </button>
          </div>

          {/* Cart items */}
          {cartState && cartState.items?.length ? (
            <>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 no-scrollbar">
                {cartState.items
                  .sort((a, b) =>
                    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                  )
                  .map((item) => (
                    <div
                      className="flex gap-4"
                      key={item.id}
                      data-testid="cart-item"
                    >
                      <LocalizedClientLink
                        href={`/products/${item.variant?.product?.handle}`}
                        className="shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-grey-20"
                        onClick={close}
                      >
                        <Thumbnail
                          thumbnail={item.variant?.product?.thumbnail}
                          images={item.variant?.product?.images}
                          size="square"
                        />
                      </LocalizedClientLink>
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <h4 className="text-[14px] font-medium text-grey-90 truncate">
                            <LocalizedClientLink
                              href={`/products/${item.variant?.product?.handle}`}
                              data-testid="product-link"
                              onClick={close}
                            >
                              {item.title}
                            </LocalizedClientLink>
                          </h4>
                          <LineItemOptions
                            variant={item.variant}
                            data-testid="cart-item-variant"
                            data-value={item.variant}
                          />
                          <span
                            className="text-[13px] text-grey-50"
                            data-testid="cart-item-quantity"
                            data-value={item.quantity}
                          >
                            Qty: {item.quantity}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <DeleteButton
                            id={item.id}
                            className="text-[12px]"
                            data-testid="cart-item-remove-button"
                          >
                            Remove
                          </DeleteButton>
                          <LineItemPrice item={item} style="tight" />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Footer */}
              <div className="border-t border-grey-20 px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-grey-90">
                    Subtotal{" "}
                    <span className="font-normal text-grey-50">(excl. taxes)</span>
                  </span>
                  <span
                    className="text-[16px] font-semibold text-grey-90"
                    data-testid="cart-subtotal"
                    data-value={subtotal}
                  >
                    {convertToLocale({
                      amount: subtotal,
                      currency_code: cartState.currency_code,
                    })}
                  </span>
                </div>
                <LocalizedClientLink href="/cart" passHref onClick={close}>
                  <Button
                    className="w-full"
                    size="large"
                    data-testid="go-to-cart-button"
                  >
                    View Cart &amp; Checkout
                  </Button>
                </LocalizedClientLink>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-grey-5">
                <ShoppingBag size={28} className="text-grey-40" />
              </div>
              <p className="text-[15px] text-grey-50">Your cart is empty</p>
              <LocalizedClientLink href="/store" onClick={close}>
                <Button>Explore Products</Button>
              </LocalizedClientLink>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CartDropdown
