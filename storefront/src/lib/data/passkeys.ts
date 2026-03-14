"use server"

import { getAuthHeaders, setAuthToken } from "./cookies"
import { revalidateTag } from "next/cache"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

/**
 * Safe fetch wrapper that never throws — returns { error } on failure.
 * This prevents Next.js from returning 500 for server action errors.
 */
async function passkeyFetch(path: string, options?: RequestInit) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string>),
    }

    const res = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      headers,
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return { error: body.error || `Request failed: ${res.status}` }
    }

    return await res.json()
  } catch (err: any) {
    return { error: err?.message || "Network error" }
  }
}

/**
 * Get registration options (authenticated).
 */
export async function getRegistrationOptions() {
  const authHeaders = await getAuthHeaders()
  return passkeyFetch("/store/custom/passkeys/register-options", {
    method: "POST",
    headers: authHeaders,
  })
}

/**
 * Verify registration response (authenticated).
 */
export async function verifyRegistration(
  challengeId: string,
  response: any,
  deviceName?: string
) {
  const authHeaders = await getAuthHeaders()
  return passkeyFetch("/store/custom/passkeys/register-verify", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ challengeId, response, deviceName }),
  })
}

/**
 * Get login options (public - no auth required).
 */
export async function getLoginOptions() {
  return passkeyFetch("/store/custom/passkeys/login-options", {
    method: "POST",
  })
}

/**
 * Verify login response and set auth token (public).
 */
export async function verifyLogin(challengeId: string, response: any) {
  const result = await passkeyFetch("/store/custom/passkeys/login-verify", {
    method: "POST",
    body: JSON.stringify({ challengeId, response }),
  })

  if (result?.error) return result

  if (result.token) {
    await setAuthToken(result.token)
    revalidateTag("customer")
  }

  return result
}

/**
 * List customer's registered passkeys (authenticated).
 */
export async function listPasskeys() {
  const authHeaders = await getAuthHeaders()
  return passkeyFetch("/store/custom/passkeys", {
    method: "GET",
    headers: authHeaders,
  })
}

/**
 * Delete a passkey (authenticated).
 */
export async function deletePasskey(id: string) {
  const authHeaders = await getAuthHeaders()
  return passkeyFetch("/store/custom/passkeys", {
    method: "DELETE",
    headers: authHeaders,
    body: JSON.stringify({ id }),
  })
}
