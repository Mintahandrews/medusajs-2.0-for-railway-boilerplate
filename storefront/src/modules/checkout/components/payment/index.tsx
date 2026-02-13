"use client"

import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { RadioGroup } from "@headlessui/react"
import ErrorMessage from "@modules/checkout/components/error-message"
import { CheckCircle2, CreditCard } from "lucide-react"
import { Button, Container, Heading, Text, Tooltip, clx } from "@medusajs/ui"
import { CardElement } from "@stripe/react-stripe-js"
import { StripeCardElementOptions } from "@stripe/stripe-js"

import Divider from "@modules/common/components/divider"
import PaymentContainer from "@modules/checkout/components/payment-container"
import PaystackChannelPicker, {
  type PaystackChannel,
} from "@modules/checkout/components/paystack-channel-picker"
import { isPaystack, isStripe as isStripeFunc, paymentInfoMap } from "@lib/constants"
import { StripeContext } from "@modules/checkout/components/payment-wrapper"
import { initiatePaymentSession } from "@lib/data/cart"

/** Human-readable labels for the Paystack channel summary */
const channelLabels: Record<PaystackChannel, string> = {
  mobile_money: "Mobile Money",
  card: "Card Payment",
  bank: "Bank Payment",
}

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const paymentSortRank = useCallback((providerId?: string) => {
    if (!providerId) {
      return 999
    }

    if (providerId.startsWith("pp_system_default")) {
      return 0
    }

    if (providerId.startsWith("pp_paystack")) {
      return 1
    }

    if (providerId.startsWith("pp_stripe")) {
      return 2
    }

    if (providerId.startsWith("pp_paypal")) {
      return 3
    }

    return 100
  }, [])

  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )
  const [selectedPaystackChannel, setSelectedPaystackChannel] =
    useState<PaystackChannel | null>(null)

  /** True when the only (or selected) provider is Paystack */
  const paystackSelected = isPaystack(selectedPaymentMethod)
  /** True when Paystack is among the available providers */
  const hasPaystack = availablePaymentMethods?.some(
    (m) => isPaystack(m.id ?? m.provider_id)
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const isStripe = isStripeFunc(activeSession?.provider_id)
  const stripeReady = useContext(StripeContext)

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession && cart?.shipping_methods.length !== 0) || paidByGiftcard

  const useOptions: StripeCardElementOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: "Inter, sans-serif",
          color: "#424270",
          "::placeholder": {
            color: "rgb(107 114 128)",
          },
        },
      },
      classes: {
        base: "pt-3 pb-1 block w-full h-11 px-4 mt-0 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover transition-all duration-300 ease-in-out",
      },
    }
  }, [])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const shouldInputCard =
        isStripeFunc(selectedPaymentMethod) && !activeSession

      // Require a channel selection when Paystack is selected
      if (paystackSelected && !selectedPaystackChannel) {
        setError("Please select a payment channel (Mobile Money, Card, or Bank).")
        setIsLoading(false)
        return
      }

      if (!activeSession) {
        const callbackUrl = isPaystack(selectedPaymentMethod)
          ? `${window.location.origin}/${pathname.split("/")[1]}/checkout/paystack/verify`
          : undefined

        try {
          // Paystack requires email and callback_url in data field
          const paymentData: Record<string, unknown> = {}
          
          if (callbackUrl) {
            paymentData.callback_url = callbackUrl
          }
          if (cart?.email) {
            paymentData.email = cart.email
          }
          // Pass the selected Paystack channel so the backend can forward it
          if (paystackSelected && selectedPaystackChannel) {
            paymentData.channels = [selectedPaystackChannel]
          }

          await initiatePaymentSession(cart, {
            provider_id: selectedPaymentMethod,
            data: Object.keys(paymentData).length ? paymentData : undefined,
          })
        } catch (sessionErr: any) {
          console.error("Payment session error:", sessionErr)
          setError(sessionErr?.message || "Failed to initialize payment. Please try again.")
          setIsLoading(false)
          return
        }
      }

      if (!shouldInputCard) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          }
        )
      }
    } catch (err: any) {
      console.error("Payment error:", err)
      setError(err?.message || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  // Auto-select Paystack provider when it is the only available method
  useEffect(() => {
    if (
      hasPaystack &&
      !selectedPaymentMethod &&
      availablePaymentMethods?.length === 1
    ) {
      const m = availablePaymentMethods[0]
      const id = m.id ?? m.provider_id
      if (isPaystack(id)) {
        setSelectedPaymentMethod(id)
      }
    }
  }, [hasPaystack, availablePaymentMethods, selectedPaymentMethod])

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !paymentReady,
            }
          )}
        >
          Payment
          {!isOpen && paymentReady && <CheckCircle2 />}
        </Heading>
        {!isOpen && paymentReady && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-payment-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && availablePaymentMethods?.length && (
            <>
              {/* NON-Paystack providers still use the standard radio list */}
              {availablePaymentMethods.some(
                (m) => !isPaystack(m.id ?? m.provider_id)
              ) && (
                <RadioGroup
                  value={selectedPaymentMethod}
                  onChange={(value: string) => {
                    setSelectedPaymentMethod(value)
                    // Clear channel selection when switching away from Paystack
                    if (!isPaystack(value)) {
                      setSelectedPaystackChannel(null)
                    }
                  }}
                >
                  {availablePaymentMethods
                    .filter((m) => !isPaystack(m.id ?? m.provider_id))
                    .sort((a, b) => {
                      const aId = a.id ?? a.provider_id
                      const bId = b.id ?? b.provider_id
                      const byRank =
                        paymentSortRank(aId) - paymentSortRank(bId)
                      if (byRank !== 0) return byRank
                      return String(aId).localeCompare(String(bId))
                    })
                    .map((paymentMethod) => {
                      const paymentMethodId =
                        paymentMethod.id ?? paymentMethod.provider_id
                      if (!paymentMethodId) return null
                      return (
                        <PaymentContainer
                          paymentInfoMap={paymentInfoMap}
                          paymentProviderId={paymentMethodId}
                          key={paymentMethodId}
                          selectedPaymentOptionId={selectedPaymentMethod}
                        />
                      )
                    })}
                </RadioGroup>
              )}

              {/* Paystack channel selection */}
              {hasPaystack && (
                <div className="mt-1">
                  <Text className="txt-medium-plus text-ui-fg-base mb-3">
                    Choose a payment method
                  </Text>
                  <PaystackChannelPicker
                    selected={selectedPaystackChannel}
                    onChange={(channel) => {
                      // Auto-select Paystack provider when a channel is picked
                      const paystackMethod = availablePaymentMethods.find(
                        (m) => isPaystack(m.id ?? m.provider_id)
                      )
                      if (paystackMethod) {
                        setSelectedPaymentMethod(
                          paystackMethod.id ?? paystackMethod.provider_id
                        )
                      }
                      setSelectedPaystackChannel(channel)
                    }}
                  />
                </div>
              )}
              {isStripe && stripeReady && (
                <div className="mt-5 transition-all duration-150 ease-in-out">
                  <Text className="txt-medium-plus text-ui-fg-base mb-1">
                    Enter your card details:
                  </Text>

                  <CardElement
                    options={useOptions as StripeCardElementOptions}
                    onChange={(e) => {
                      setCardBrand(
                        e.brand &&
                          e.brand.charAt(0).toUpperCase() + e.brand.slice(1)
                      )
                      setError(e.error?.message || null)
                      setCardComplete(e.complete)
                    }}
                  />
                </div>
              )}
            </>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col w-full small:w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <Button
            size="large"
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={
              (isStripe && !cardComplete) ||
              (!selectedPaymentMethod && !paidByGiftcard) ||
              (paystackSelected && !selectedPaystackChannel)
            }
            data-testid="submit-payment-button"
          >
            {!activeSession && isStripeFunc(selectedPaymentMethod)
              ? " Enter card details"
              : "Continue to review"}
          </Button>
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="grid grid-cols-1 small:grid-cols-3 gap-8 w-full">
              <div className="flex flex-col">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Payment method
                </Text>
                <Text
                  className="txt-medium text-ui-fg-subtle"
                  data-testid="payment-method-summary"
                >
                  {paystackSelected && selectedPaystackChannel
                    ? channelLabels[selectedPaystackChannel]
                    : paymentInfoMap[selectedPaymentMethod]?.title ||
                      selectedPaymentMethod}
                </Text>
              </div>
              <div className="flex flex-col">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Payment details
                </Text>
                <div
                  className="flex gap-2 txt-medium text-ui-fg-subtle items-center"
                  data-testid="payment-details-summary"
                >
                  <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <CreditCard />
                    )}
                  </Container>
                  <Text>
                    {isStripeFunc(selectedPaymentMethod) && cardBrand
                      ? cardBrand
                      : paystackSelected && selectedPaystackChannel
                        ? `Via Paystack (${channelLabels[selectedPaystackChannel]})`
                        : "Another step will appear"}
                  </Text>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-full small:w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          ) : null}
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default Payment
