"use client"

import { placeOrder } from "@lib/data/cart"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"

const MAX_AUTO_RETRIES = 1

function PaystackVerifyContent() {
  const params = useParams()
  const searchParams = useSearchParams()

  const countryCode = (params.countryCode as string) || "gh"
  const reference = searchParams.get("reference") || searchParams.get("trxref")

  const [status, setStatus] = useState<"loading" | "error" | "success">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [retrying, setRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Guard against double invocation (React strict mode, re-renders)
  const calledRef = useRef(false)

  const completeOrder = useCallback(async () => {
    setStatus("loading")
    setErrorMessage("")

    try {
      const result = await placeOrder()

      // placeOrder() calls redirect() on success — if it returns, check for error
      if (result?.error) {
        setStatus("error")
        setErrorMessage(result.error)
        return
      }

      // Returned without error and without redirect — treat as success
      setStatus("success")
    } catch (error: any) {
      // NEXT_REDIRECT is thrown by some Next.js versions when redirect() is used
      // inside a Server Action. This is expected and means the order was created.
      if (
        error?.message?.includes("NEXT_REDIRECT") ||
        error?.digest?.includes("NEXT_REDIRECT")
      ) {
        setStatus("success")
        return
      }

      // Generic Next.js production error — the actual message is hidden server-side
      console.error("Paystack verify - placeOrder threw:", error)
      setStatus("error")
      setErrorMessage(
        "An unexpected error occurred while completing your order. Your payment may have been received — please check your email or contact support."
      )
    } finally {
      setRetrying(false)
    }
  }, [])

  useEffect(() => {
    if (!reference) {
      setStatus("error")
      setErrorMessage("Missing Paystack reference")
      return
    }

    // Prevent duplicate calls
    if (calledRef.current) return
    calledRef.current = true

    completeOrder()
  }, [reference, completeOrder])

  const handleRetry = () => {
    setRetrying(true)
    setRetryCount((c) => c + 1)
    completeOrder()
  }

  if (status === "loading") {
    return (
      <div className="content-container py-16 flex flex-col items-center">
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 border-t-violet-600" />
        </div>
        <h1 className="text-xl font-semibold text-ui-fg-base">
          Verifying your payment…
        </h1>
        <p className="mt-2 text-ui-fg-subtle text-center max-w-md">
          Please wait while we confirm your payment and create your order. Do
          not close this page.
        </p>
        {reference && (
          <p className="mt-4 text-xs text-ui-fg-muted">
            Reference: {reference}
          </p>
        )}
      </div>
    )
  }

  if (status === "error") {
    const canRetry = retryCount < MAX_AUTO_RETRIES
    return (
      <div className="content-container py-16 flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mb-5">
          <svg
            className="w-7 h-7 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-red-600">
          Order Completion Issue
        </h1>
        <p className="mt-2 text-ui-fg-subtle max-w-md">{errorMessage}</p>
        {reference && (
          <p className="mt-3 text-xs text-ui-fg-muted">
            Payment Reference: <span className="font-mono">{reference}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
          {canRetry && (
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="px-6 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              {retrying ? "Retrying…" : "Try Again"}
            </button>
          )}
          <Link
            href="mailto:support@letscasegh.com"
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Contact Support
          </Link>
          <Link
            href={`/${countryCode}/checkout`}
            className="text-sm text-ui-fg-interactive hover:text-ui-fg-interactive-hover underline"
          >
            Return to Checkout
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="content-container py-16 flex flex-col items-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-50 mb-5">
        <svg
          className="w-7 h-7 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 12.75 6 6 9-13.5"
          />
        </svg>
      </div>
      <h1 className="text-xl font-semibold text-green-700">
        Payment Successful!
      </h1>
      <p className="mt-2 text-ui-fg-subtle">
        Redirecting to your order confirmation…
      </p>
    </div>
  )
}

export default function PaystackVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="content-container py-16 flex flex-col items-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 border-t-violet-600" />
          <h1 className="text-xl font-semibold mt-6">Loading…</h1>
        </div>
      }
    >
      <PaystackVerifyContent />
    </Suspense>
  )
}
