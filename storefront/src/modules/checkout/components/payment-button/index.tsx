"use client"

import { Button } from "@medusajs/ui"
import { OnApproveActions, OnApproveData } from "@paypal/paypal-js"
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useEffect, useState } from "react"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import ErrorMessage from "../error-message"
import Spinner from "@modules/common/icons/spinner"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { isManual, isPaypal, isPaystack, isStripe, PAYSTACK_PUBLIC_KEY } from "@lib/constants"
import { convertToLocale } from "@lib/util/money"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.shipping_address?.phone

  // TODO: Add this once gift cards are implemented
  // const paidByGiftcard =
  //   cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  // if (paidByGiftcard) {
  //   return <GiftCardPaymentButton />
  // }

  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (session) => session.status === "pending"
  )

  switch (true) {
    case isStripe(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isPaystack(paymentSession?.provider_id):
      return (
        <PaystackPaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )

    case isPaypal(paymentSession?.provider_id):
      return (
        <PayPalPaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    default:
      return <MissingPaymentSessionButton />
  }
}

const MissingPaymentSessionButton = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const goToPayment = () => {
    const params = new URLSearchParams(searchParams)
    params.set("step", "payment")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return <Button onClick={goToPayment}>Select payment method</Button>
}

const GiftCardPaymentButton = () => {
  const [submitting, setSubmitting] = useState(false)

  const handleOrder = async () => {
    setSubmitting(true)
    await placeOrder()
  }

  return (
    <Button
      onClick={handleOrder}
      isLoading={submitting}
      data-testid="submit-order-button"
    >
      Place order
    </Button>
  )
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }

        return
      })
  }

  return (
    <>
        <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        Make payment
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const PayPalPaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const handlePayment = async (
    _data: OnApproveData,
    actions: OnApproveActions
  ) => {
    actions?.order
      ?.authorize()
      .then((authorization) => {
        if (authorization.status !== "COMPLETED") {
          setErrorMessage(`An error occurred, status: ${authorization.status}`)
          return
        }
        onPaymentCompleted()
      })
      .catch(() => {
        setErrorMessage(`An unknown error occurred, please try again.`)
        setSubmitting(false)
      })
  }

  const [{ isPending, isResolved }] = usePayPalScriptReducer()

  if (isPending) {
    return <Spinner />
  }

  if (isResolved) {
    return (
      <>
        <PayPalButtons
          style={{ layout: "horizontal" }}
          createOrder={async () => session?.data.id as string}
          onApprove={handlePayment}
          disabled={notReady || submitting || isPending}
          data-testid={dataTestId}
        />
        <ErrorMessage
          error={errorMessage}
          data-testid="paypal-payment-error-message"
        />
      </>
    )
  }

  return null
}

/** Channel labels for the Paystack button */
const paystackChannelLabels: Record<string, string> = {
  mobile_money: "Mobile Money",
  card: "Card",
}

const PaystackPaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const params = useParams()
  const countryCode = (params.countryCode as string) || ""

  // Derive channel-aware button label
  const channels = Array.isArray(session?.data?.channels)
    ? (session?.data?.channels as string[])
    : undefined
  const channelLabel = channels?.[0]
    ? paystackChannelLabels[channels[0]] || "Paystack"
    : "Paystack"

  // Format cart total for the button
  const formattedTotal =
    cart.total != null && cart.currency_code
      ? convertToLocale({
          amount: cart.total,
          currency_code: cart.currency_code,
        })
      : null

  // Auto-clear the "dismissed" message after a few seconds
  useEffect(() => {
    if (!dismissed) return
    const t = setTimeout(() => setDismissed(false), 4000)
    return () => clearTimeout(t)
  }, [dismissed])

  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined") return reject()
      if ((window as any).PaystackPop) return resolve()
      const s = document.createElement("script")
      s.src = src
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => reject()
      document.body.appendChild(s)
    })

  const handlePayment = async () => {
    setErrorMessage(null)
    setDismissed(false)
    setSubmitting(true)

    const url = session?.data?.authorization_url as string | undefined
    const reference = session?.data?.reference as string | undefined
    const paystackEmail =
      cart.email ||
      `${String(cart.shipping_address?.phone ?? "")
        .replace(/\D/g, "")
        .trim() || "guest"}@guest.local`

    // If a public key is available, open Paystack inline modal (keeps user on-site).
    if (PAYSTACK_PUBLIC_KEY && reference) {
      try {
        await loadScript("https://js.paystack.co/v1/inline.js")
        const paystack = (window as any).PaystackPop
        if (!paystack) throw new Error("Paystack script failed to load")

        const handler = paystack.setup({
          key: PAYSTACK_PUBLIC_KEY,
          email: paystackEmail,
          amount: session?.data?.amount ?? undefined,
          currency: (String(session?.data?.currency ?? "")).toUpperCase(),
          ref: reference,
          ...(channels?.length ? { channels } : {}),
          callback: function (res: any) {
            const resolvedCountryCode =
              countryCode || window.location.pathname.split("/")[1] || "gh"
            window.location.href = `${window.location.origin}/${resolvedCountryCode}/checkout/paystack/verify?reference=${res.reference}`
          },
          onClose: function () {
            setSubmitting(false)
            setDismissed(true)
          },
        })

        if (handler && typeof handler.openIframe === "function") {
          handler.openIframe()
          return
        }
      } catch (err: any) {
        console.warn("Paystack inline failed, falling back to redirect:", err)
      }
    }

    // Fallback: redirect to Paystack hosted page
    if (!url) {
      setErrorMessage("Missing Paystack authorization URL. Please go back and reselect your payment method.")
      setSubmitting(false)
      return
    }

    window.location.href = url
  }

  return (
    <>
      {dismissed && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Payment window was closed. Click the button below to try again.
        </div>
      )}
      <Button
        disabled={notReady || submitting}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        className="w-full"
        data-testid={dataTestId}
      >
        {submitting
          ? "Processing…"
          : `Pay${formattedTotal ? ` ${formattedTotal}` : ""} with ${channelLabel}`}
      </Button>
      <ErrorMessage error={errorMessage} data-testid="paystack-payment-error-message" />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)

    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid="submit-order-button"
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
