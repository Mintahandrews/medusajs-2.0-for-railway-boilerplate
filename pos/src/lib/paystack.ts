/**
 * Paystack Charge API client for POS payments.
 *
 * Uses Paystack's server-side Charge API to process:
 *   - Mobile Money (MTN, Telecel/Vodafone, AirtelTigo)
 *   - Transaction verification & polling
 *
 * The secret key is kept server-side via API routes.
 * This file provides the types and the client-side helpers
 * that call our Next.js API routes (which proxy to Paystack).
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type MoMoProvider = "mtn" | "vod" | "atl"

export interface PaystackChargeRequest {
  email: string
  amount: number // in pesewas
  currency?: string
  reference?: string
  mobile_money: {
    phone: string
    provider: MoMoProvider
  }
  metadata?: Record<string, unknown>
}

export interface PaystackChargeResponse {
  status: boolean
  message: string
  data: {
    reference: string
    status: "pay_offline" | "success" | "failed" | "pending" | "send_otp"
    display_text?: string
    amount?: number
    currency?: string
    transaction_date?: string
    gateway_response?: string
  }
}

export interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    id: number
    status: "success" | "failed" | "abandoned" | "pending"
    reference: string
    amount: number
    currency: string
    paid_at?: string
    channel?: string
    gateway_response?: string
    message?: string
    metadata?: Record<string, unknown>
    customer?: {
      email?: string
      phone?: string
    }
  }
}

// ─── Client helpers (call our API routes) ────────────────────────────────────

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("pos_admin_token") || "" : ""
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function chargeMobileMoney(
  payload: PaystackChargeRequest
): Promise<PaystackChargeResponse> {
  const res = await fetch("/api/paystack/charge", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Charge failed" }))
    throw new Error(err.message || `Paystack charge failed: ${res.status}`)
  }
  return res.json()
}

export async function verifyTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  const res = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Verification failed" }))
    throw new Error(err.message || `Verification failed: ${res.status}`)
  }
  return res.json()
}

/**
 * Poll Paystack until the transaction succeeds, fails, or times out.
 * Mobile money transactions can take up to 180 seconds.
 */
export async function pollTransactionStatus(
  reference: string,
  {
    intervalMs = 5000,
    timeoutMs = 190000,
    onPoll,
  }: {
    intervalMs?: number
    timeoutMs?: number
    onPoll?: (status: string) => void
  } = {}
): Promise<PaystackVerifyResponse> {
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, intervalMs))

    const result = await verifyTransaction(reference)
    const status = result.data.status

    onPoll?.(status)

    if (status === "success") return result
    if (status === "failed" || status === "abandoned") {
      throw new Error(result.data.gateway_response || result.data.message || "Payment failed")
    }
    // status === "pending" → keep polling
  }

  throw new Error("Payment timed out. The customer did not complete authorization in time.")
}

// ─── Provider display names ──────────────────────────────────────────────────

export const MOMO_PROVIDERS: { code: MoMoProvider; name: string; color: string }[] = [
  { code: "mtn", name: "MTN MoMo", color: "#FFC107" },
  { code: "vod", name: "Telecel Cash", color: "#E60000" },
  { code: "atl", name: "AirtelTigo Money", color: "#E40046" },
]
