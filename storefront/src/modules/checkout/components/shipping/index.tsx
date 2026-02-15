"use client"

import { RadioGroup } from "@headlessui/react"
import {
  CheckCircle2,
  MapPin,
  Search,
  Truck,
  X,
  ChevronRight,
  Package,
} from "lucide-react"
import { Button, Heading, Text, clx } from "@medusajs/ui"

import Divider from "@modules/common/components/divider"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useEffect, useState, useMemo, useCallback, useRef } from "react"
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
  const [settingMethodId, setSettingMethodId] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  /* ----- auto-detect delivery area from the shipping address ----- */
  const detectedArea = useMemo(() => {
    const addr = cart?.shipping_address
    if (!addr) return ""
    return (addr.city || addr.province || addr.address_1 || "").trim()
  }, [cart?.shipping_address])

  const fullAddress = useMemo(() => {
    const addr = cart?.shipping_address
    if (!addr) return ""
    const parts = [addr.address_1, addr.city, addr.province].filter(Boolean)
    return parts.join(", ")
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
    const matched = availableShippingMethods.filter((opt) =>
      opt.name?.toLowerCase().includes(query)
    )
    return matched.length > 0 ? matched : availableShippingMethods
  }, [availableShippingMethods, areaSearch])

  const isShowingAll =
    areaSearch.trim() &&
    filteredShippingMethods.length === availableShippingMethods?.length &&
    availableShippingMethods?.length !== 0

  const selectedShippingMethod = availableShippingMethods?.find(
    (method) => method.id === cart.shipping_methods?.at(-1)?.shipping_option_id
  )

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = () => {
    router.push(pathname + "?step=payment", { scroll: false })
  }

  const set = useCallback(
    async (id: string) => {
      setSettingMethodId(id)
      setIsLoading(true)
      await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
        .catch((err) => {
          setError(err.message)
        })
        .finally(() => {
          setIsLoading(false)
          setSettingMethodId(null)
        })
    },
    [cart.id]
  )

  // Auto-select when only one filtered option
  useEffect(() => {
    if (
      isOpen &&
      filteredShippingMethods.length === 1 &&
      filteredShippingMethods[0].id !== selectedShippingMethod?.id &&
      !isLoading
    ) {
      set(filteredShippingMethods[0].id)
    }
  }, [filteredShippingMethods, isOpen, selectedShippingMethod?.id, isLoading, set])

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const hasSelection = (cart.shipping_methods?.length ?? 0) > 0

  return (
    <div className="bg-white">
      {/* ---- Header ---- */}
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-center",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !hasSelection,
            }
          )}
        >
          Delivery
          {!isOpen && hasSelection && (
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
          {/* ---- Delivery address badge ---- */}
          {detectedArea && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-emerald-50 border border-emerald-100 mb-5">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100">
                <MapPin size={14} className="text-emerald-600" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-emerald-700">
                  Delivering to
                </span>
                <span className="text-sm font-semibold text-emerald-900 truncate">
                  {fullAddress || detectedArea}
                </span>
              </div>
            </div>
          )}

          {/* ---- Area search ---- */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-ui-fg-subtle mb-1.5">
              Search your delivery area
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-muted pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={areaSearch}
                onChange={(e) => setAreaSearch(e.target.value)}
                placeholder="Type your area name…"
                className="w-full pl-9 pr-9 py-2.5 text-sm border border-ui-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-ui-bg-field transition-all"
                data-testid="delivery-area-search"
              />
              {areaSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setAreaSearch("")
                    searchInputRef.current?.focus()
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ui-fg-muted hover:text-ui-fg-base transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {/* Result count / fallback message */}
            <div className="flex items-center justify-between mt-1.5">
              {areaSearch.trim() && (
                <p className="text-xs text-ui-fg-muted">
                  {isShowingAll
                    ? "No exact match — showing all options"
                    : `${filteredShippingMethods.length} option${filteredShippingMethods.length !== 1 ? "s" : ""} found`}
                </p>
              )}
            </div>
          </div>

          {/* ---- Shipping options ---- */}
          <div className="pb-4">
            {filteredShippingMethods.length > 0 ? (
              <RadioGroup value={selectedShippingMethod?.id} onChange={set}>
                <div className="flex flex-col gap-2.5">
                  {filteredShippingMethods.map((option) => {
                    const price = formatShippingPrice(
                      option.amount,
                      cart?.currency_code
                    )
                    const isSelected =
                      option.id === selectedShippingMethod?.id
                    const isSetting = settingMethodId === option.id

                    return (
                      <RadioGroup.Option
                        key={option.id}
                        value={option.id}
                        data-testid="delivery-option-radio"
                        className={clx(
                          "relative flex items-center gap-3.5 cursor-pointer py-3.5 px-4 border rounded-xl transition-all duration-200",
                          "hover:border-emerald-300 hover:bg-emerald-50/30",
                          {
                            "border-emerald-500 bg-emerald-50/50 shadow-sm shadow-emerald-100":
                              isSelected,
                            "border-ui-border-base bg-white": !isSelected,
                          }
                        )}
                      >
                        {/* Icon */}
                        <div
                          className={clx(
                            "flex items-center justify-center w-10 h-10 rounded-lg shrink-0 transition-colors",
                            {
                              "bg-emerald-100 text-emerald-600": isSelected,
                              "bg-gray-100 text-gray-400": !isSelected,
                            }
                          )}
                        >
                          <Truck size={18} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={clx("text-sm font-medium", {
                                "text-emerald-900": isSelected,
                                "text-ui-fg-base": !isSelected,
                              })}
                            >
                              {option.name}
                            </span>
                            {isSetting && (
                              <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            )}
                          </div>
                          <span className="text-xs text-ui-fg-muted">
                            Standard delivery
                          </span>
                        </div>

                        {/* Price + radio */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={clx(
                              "text-sm font-semibold whitespace-nowrap",
                              {
                                "text-emerald-700": isSelected && price === "Free",
                                "text-emerald-900": isSelected && price !== "Free",
                                "text-ui-fg-base": !isSelected && price !== "—",
                                "text-ui-fg-muted italic":
                                  !isSelected && price === "—",
                              }
                            )}
                          >
                            {price}
                          </span>
                          {/* Custom radio indicator */}
                          <div
                            className={clx(
                              "flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all",
                              {
                                "border-emerald-500 bg-emerald-500": isSelected,
                                "border-gray-300 bg-white": !isSelected,
                              }
                            )}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                      </RadioGroup.Option>
                    )
                  })}
                </div>
              </RadioGroup>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                  <Package size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-ui-fg-muted">
                  No delivery options for this area
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAreaSearch("")
                    searchInputRef.current?.focus()
                  }}
                  className="text-xs text-emerald-600 font-medium hover:underline"
                >
                  Clear search and show all
                </button>
              </div>
            )}
          </div>

          <ErrorMessage
            error={error}
            data-testid="delivery-option-error-message"
          />

          <Button
            size="large"
            className="mt-4 w-full"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!hasSelection}
            data-testid="submit-delivery-option-button"
          >
            <span className="flex items-center justify-center gap-2">
              Continue to payment
              <ChevronRight size={16} />
            </span>
          </Button>
        </div>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && hasSelection && (
              <div className="flex items-center gap-3 px-3.5 py-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                  <Truck size={16} />
                </div>
                <div className="flex flex-col">
                  <Text className="txt-medium-plus text-ui-fg-base">
                    {selectedShippingMethod?.name}
                  </Text>
                  <Text className="txt-small text-ui-fg-subtle">
                    {formatShippingPrice(
                      selectedShippingMethod?.amount,
                      cart?.currency_code
                    )}
                  </Text>
                </div>
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
