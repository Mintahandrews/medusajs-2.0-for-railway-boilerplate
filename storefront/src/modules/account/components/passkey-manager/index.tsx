"use client"

import { useCallback, useEffect, useState } from "react"
import { browserSupportsWebAuthn, startRegistration } from "@simplewebauthn/browser"
import {
  getRegistrationOptions,
  verifyRegistration,
  listPasskeys,
  deletePasskey,
} from "@lib/data/passkeys"

type Passkey = {
  id: string
  device_name: string
  created_at: string
}

export default function PasskeyManager() {
  const [supported, setSupported] = useState(false)
  const [passkeys, setPasskeys] = useState<Passkey[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    setSupported(browserSupportsWebAuthn())
  }, [])

  const fetchPasskeys = useCallback(async () => {
    try {
      const data = await listPasskeys()
      setPasskeys(data.passkeys || [])
    } catch {
      // Silently fail — user might not have any
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (supported) fetchPasskeys()
    else setLoading(false)
  }, [supported, fetchPasskeys])

  const handleRegister = useCallback(async () => {
    setRegistering(true)
    setError(null)
    setSuccess(null)
    try {
      const { options, challengeId } = await getRegistrationOptions()
      const regResponse = await startRegistration({ optionsJSON: options })

      // Try to detect device name
      const ua = navigator.userAgent
      let deviceName = "Unknown device"
      if (/iPhone/.test(ua)) deviceName = "iPhone"
      else if (/iPad/.test(ua)) deviceName = "iPad"
      else if (/Android/.test(ua)) deviceName = "Android"
      else if (/Mac/.test(ua)) deviceName = "Mac"
      else if (/Windows/.test(ua)) deviceName = "Windows"
      else if (/Linux/.test(ua)) deviceName = "Linux"

      await verifyRegistration(challengeId, regResponse, deviceName)
      setSuccess("Passkey registered! You can now sign in with biometric.")
      fetchPasskeys()
    } catch (err: any) {
      const msg = err?.message || ""
      if (msg.includes("cancelled") || msg.includes("AbortError")) {
        // User cancelled
      } else {
        setError(msg || "Failed to register passkey")
      }
    } finally {
      setRegistering(false)
    }
  }, [fetchPasskeys])

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Remove this passkey? You won't be able to use it for biometric sign-in.")) return
      try {
        await deletePasskey(id)
        setPasskeys((prev) => prev.filter((p) => p.id !== id))
      } catch (err: any) {
        setError(err?.message || "Failed to remove passkey")
      }
    },
    []
  )

  if (!supported) {
    return (
      <div>
        <h2 className="text-base-semi">Biometric Sign-in</h2>
        <p className="text-small-regular text-ui-fg-subtle mt-1">
          Your browser or device doesn&apos;t support passkeys.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base-semi">Biometric Sign-in</h2>
          <p className="text-small-regular text-ui-fg-subtle mt-1">
            Use Face ID, Touch ID, or your device PIN to sign in faster.
          </p>
        </div>
        <button
          onClick={handleRegister}
          disabled={registering}
          className="text-sm font-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover disabled:opacity-50"
        >
          {registering ? "Registering..." : "+ Add passkey"}
        </button>
      </div>

      {error && (
        <p className="text-rose-500 text-small-regular mt-3">{error}</p>
      )}
      {success && (
        <p className="text-green-600 text-small-regular mt-3">{success}</p>
      )}

      {loading ? (
        <p className="text-small-regular text-ui-fg-muted mt-4">Loading...</p>
      ) : passkeys.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3">
          {passkeys.map((pk) => (
            <div
              key={pk.id}
              className="flex items-center justify-between p-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle"
            >
              <div>
                <p className="text-sm font-medium">{pk.device_name}</p>
                <p className="text-xs text-ui-fg-muted">
                  Added {new Date(pk.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(pk.id)}
                className="text-xs text-rose-500 hover:text-rose-700 font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-small-regular text-ui-fg-muted mt-4">
          No passkeys registered yet. Add one to enable biometric sign-in.
        </p>
      )}
    </div>
  )
}
