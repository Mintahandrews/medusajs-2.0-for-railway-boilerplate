"use client"

import { useActionState, useEffect, useState, useCallback } from "react"
import { browserSupportsWebAuthn, startAuthentication } from "@simplewebauthn/browser"

import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { login } from "@lib/data/customer"
import { getLoginOptions, verifyLogin } from "@lib/data/passkeys"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const [supportsPasskey, setSupportsPasskey] = useState(false)
  const [passkeyLoading, setPasskeyLoading] = useState(false)
  const [passkeyError, setPasskeyError] = useState<string | null>(null)

  useEffect(() => {
    setSupportsPasskey(browserSupportsWebAuthn())
  }, [])

  const handlePasskeyLogin = useCallback(async () => {
    setPasskeyLoading(true)
    setPasskeyError(null)
    try {
      const { options, challengeId } = await getLoginOptions()
      const authResponse = await startAuthentication({ optionsJSON: options })
      await verifyLogin(challengeId, authResponse)
      // Token is set by verifyLogin — reload to pick up the authenticated state
      window.location.reload()
    } catch (err: any) {
      const msg = err?.message || ""
      if (msg.includes("cancelled") || msg.includes("AbortError")) {
        // User cancelled the prompt — not an error
      } else {
        setPasskeyError(msg || "Biometric sign-in failed. Please use your password.")
      }
    } finally {
      setPasskeyLoading(false)
    }
  }, [])

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Welcome back</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Sign in to access an enhanced shopping experience.
      </p>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email or Phone Number"
            name="identifier"
            type="text"
            title="Enter your email address or phone number."
            autoComplete="username"
            required
            data-testid="identifier-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          Sign in
        </SubmitButton>
      </form>
      <LocalizedClientLink
        href="/reset-password"
        className="text-small-regular text-ui-fg-interactive hover:text-ui-fg-interactive-hover mt-4 inline-block"
      >
        Forgot password?
      </LocalizedClientLink>
      {supportsPasskey && (
        <>
          <div className="flex items-center gap-3 w-full mt-6">
            <div className="flex-1 h-px bg-ui-border-base" />
            <span className="text-small-regular text-ui-fg-muted">or</span>
            <div className="flex-1 h-px bg-ui-border-base" />
          </div>
          <button
            type="button"
            onClick={handlePasskeyLogin}
            disabled={passkeyLoading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 border border-ui-border-base rounded-lg hover:bg-ui-bg-subtle transition-colors disabled:opacity-50"
            data-testid="passkey-login-button"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 9.354a4 4 0 10-6 0" />
            </svg>
            <span className="text-sm font-medium">
              {passkeyLoading ? "Verifying..." : "Sign in with biometric"}
            </span>
          </button>
          {passkeyError && (
            <p className="text-rose-500 text-small-regular mt-2 text-center">
              {passkeyError}
            </p>
          )}
        </>
      )}
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Not a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          Join us
        </button>
        .
      </span>
    </div>
  )
}

export default Login
