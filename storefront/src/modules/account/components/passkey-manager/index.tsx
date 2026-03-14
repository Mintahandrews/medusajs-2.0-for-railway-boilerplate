"use client"

import { useCallback, useEffect, useState } from "react"
import { Button, Badge } from "@medusajs/ui"
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
    // Dynamically check WebAuthn support on the client only
    import("@simplewebauthn/browser").then((mod) => {
      setSupported(mod.browserSupportsWebAuthn())
    }).catch(() => {
      setSupported(false)
    })
  }, [])

  const fetchPasskeys = useCallback(async () => {
    try {
      const data = await listPasskeys()
      if (!data?.error) {
        setPasskeys(data.passkeys || [])
      }
    } catch {
      // Silently fail
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
      const regOpts = await getRegistrationOptions()
      if (regOpts?.error) {
        setError(regOpts.error)
        return
      }

      const { startRegistration } = await import("@simplewebauthn/browser")
      const regResponse = await startRegistration({ optionsJSON: regOpts.options })

      // Detect device name from user agent
      const ua = navigator.userAgent
      let deviceName = "Unknown device"
      if (/iPhone/.test(ua)) deviceName = "iPhone"
      else if (/iPad/.test(ua)) deviceName = "iPad"
      else if (/Android/.test(ua)) deviceName = "Android"
      else if (/Mac/.test(ua)) deviceName = "Mac"
      else if (/Windows/.test(ua)) deviceName = "Windows"
      else if (/Linux/.test(ua)) deviceName = "Linux"

      const verifyResult = await verifyRegistration(regOpts.challengeId, regResponse, deviceName)
      if (verifyResult?.error) {
        setError(verifyResult.error)
        return
      }

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
        const result = await deletePasskey(id)
        if (result?.error) {
          setError(result.error)
          return
        }
        setPasskeys((prev) => prev.filter((p) => p.id !== id))
      } catch (err: any) {
        setError(err?.message || "Failed to remove passkey")
      }
    },
    []
  )

  // Don't render anything until we know if passkeys are supported
  if (!supported) {
    return (
      <div className="text-small-regular">
        <div className="flex flex-col">
          <span className="uppercase text-ui-fg-base">Biometric Sign-in</span>
          <span className="text-ui-fg-subtle mt-1">
            Your browser or device doesn&apos;t support passkeys.
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="text-small-regular">
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="uppercase text-ui-fg-base">Biometric Sign-in</span>
          <span className="text-ui-fg-subtle mt-1">
            Use Face ID, Touch ID, or your device PIN to sign in faster.
          </span>
        </div>
        <div>
          <Button
            variant="secondary"
            className="w-[140px] min-h-[25px] py-1"
            onClick={handleRegister}
            disabled={registering}
            type="button"
            data-testid="add-passkey-button"
          >
            {registering ? "Registering..." : "Add passkey"}
          </Button>
        </div>
      </div>

      {error && (
        <Badge className="p-2 my-4" color="red">
          <span>{error}</span>
        </Badge>
      )}

      {success && (
        <Badge className="p-2 my-4" color="green">
          <span>{success}</span>
        </Badge>
      )}

      {loading ? (
        <p className="text-ui-fg-muted mt-4">Loading...</p>
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
              <Button
                variant="secondary"
                className="min-h-[25px] py-1 text-xs"
                onClick={() => handleDelete(pk.id)}
                type="button"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-ui-fg-muted mt-4">
          No passkeys registered yet. Add one to enable biometric sign-in.
        </p>
      )}
    </div>
  )
}
