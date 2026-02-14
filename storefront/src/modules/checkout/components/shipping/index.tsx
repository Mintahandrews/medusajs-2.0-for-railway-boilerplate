"use client"

import { RadioGroup } from "@headlessui/react"
import { CheckCircle2, MapPin, Search } from "lucide-react"
import { Button, Heading, Text, clx } from "@medusajs/ui"

import Divider from "@modules/common/components/divider"
import Radio from "@modules/common/components/radio"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { setShippingMethod } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

/** Safely format a shipping price – returns "Free" for 0 and "—" for null/undefined */
function formatShippingPrice(
  amount: number | null | undefined,
  currencyCode: string
): string {
  if (amount == null || isNaN(Number(amount))) return "—"
  if (amount === 0) return "Free"
  return convertToLocale({ amount, currency_code: currencyCode })
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [areaSearch, setAreaSearch] = useState("")

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  /* ----- auto-detect delivery area from the shipping address ----- */
  const detectedArea = useMemo(() => {
    const addr = cart?.shipping_address
    if (!addr) return ""
    // Prefer city, then province, then address_1 for area detection
    return (addr.city || addr.province || addr.address_1 || "").trim()
  }, [cart?.shipping_address])

  // Pre-fill the area search from the shipping address when the step opens
  useEffect(() => {
    if (isOpen && detectedArea && !areaSearch) {
      setAreaSearch(detectedArea)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, detectedArea])

  /* ----- filter shipping options by the area search term ----- */
  const filteredShippingMethods = useMemo(() => {
    if (!availableShippingMethods) return []
    if (!areaSearch.trim()) return availableShippingMethods
    const query = areaSearch.toLowerCase().trim()
    // First try exact / partial name match
    const matched = availableShippingMethods.filter((opt) =>
      opt.name?.toLowerCase().includes(query)
    )
    // If nothing matches, show all (so user can still pick)
    return matched.length > 0 ? matched : availableShippingMethods
  }, [availableShippingMethods, areaSearch])

  const selectedShippingMethod = availableShippingMethods?.find(
    // To do: remove the previously selected shipping method instead of using the last one
    (method) => method.id === cart.shipping_methods?.at(-1)?.shipping_option_id
  )

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = () => {
    router.push(pathname + "?step=payment", { scroll: false })
  }

  const set = async (id: string) => {
    setIsLoading(true)
    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && cart.shipping_methods?.length === 0,
            }
          )}
        >
          Delivery
          {!isOpen && (cart.shipping_methods?.length ?? 0) > 0 && (
            <CheckCircle2 size={20} className="text-green-500" />
          )}
        </Heading>
        {!isOpen &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
            <Text>
              <button
                onClick={handleEdit}
                className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                data-testid="edit-delivery-button"
              >
                Edit
              </button>
            </Text>
          )}
      </div>
      {isOpen ? (
        <div data-testid="delivery-options-container">
          {/* ---- Delivery area detection / search ---- */}
          <div className="mb-4">
            {detectedArea && (
              <div className="flex items-center gap-2 text-sm text-ui-fg-subtle mb-2">
                <MapPin size={14} className="text-green-600 shrink-0" />
                <span>
                  Delivering to{" "}
                  <strong className="text-ui-fg-base">{detectedArea}</strong>
                </span>
              </div>
            )}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-muted pointer-events-none"
              />
              <input
                type="text"
                value={areaSearch}
                onChange={(e) => setAreaSearch(e.target.value)}
                placeholder="Search delivery area…"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-ui-border-base rounded-lg focus:outline-none focus:border-ui-border-interactive bg-ui-bg-field"
                data-testid="delivery-area-search"
              />
            </div>
            {areaSearch.trim() &&
              filteredShippingMethods.length ===
                availableShippingMethods?.length && (
                <p className="text-xs text-ui-fg-muted mt-1">
                  No exact area match — showing all delivery options
                </p>
              )}
          </div>

          <div className="pb-8">
            <RadioGroup value={selectedShippingMethod?.id} onChange={set}>
              {filteredShippingMethods.map((option) => {
                const price = formatShippingPrice(
                  option.amount,
                  cart?.currency_code
                )
                return (
                  <RadioGroup.Option
                    key={option.id}
                    value={option.id}
                    data-testid="delivery-option-radio"
                    className={clx(
                      "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
                      {
                        "border-ui-border-interactive":
                          option.id === selectedShippingMethod?.id,
                      }
                    )}
                  >
                    <div className="flex items-center gap-x-4">
                      <Radio
                        checked={option.id === selectedShippingMethod?.id}
                      />
                      <span className="text-base-regular">{option.name}</span>
                    </div>
                    <span
                      className={clx("justify-self-end", {
                        "text-ui-fg-base": price !== "—",
                        "text-ui-fg-muted italic": price === "—",
                      })}
                    >
                      {price}
                    </span>
                  </RadioGroup.Option>
                )
              })}
            </RadioGroup>
            {filteredShippingMethods.length === 0 && (
              <p className="text-sm text-ui-fg-muted py-4 text-center">
                No delivery options available for this area. Try a different
                search term.
              </p>
            )}
          </div>

          <ErrorMessage
            error={error}
            data-testid="delivery-option-error-message"
          />

          <Button
            size="large"
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!cart.shipping_methods?.[0]}
            data-testid="submit-delivery-option-button"
          >
            Continue to payment
          </Button>
        </div>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && (cart.shipping_methods?.length ?? 0) > 0 && (
              <div className="flex flex-col w-full small:w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Method
                </Text>
                <Text className="txt-medium text-ui-fg-subtle">
                  {selectedShippingMethod?.name}{" "}
                  {formatShippingPrice(
                    selectedShippingMethod?.amount,
                    cart?.currency_code
                  )}
                </Text>
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Shipping
