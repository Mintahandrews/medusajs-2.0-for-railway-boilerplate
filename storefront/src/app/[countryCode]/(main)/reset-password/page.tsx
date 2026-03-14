"use client"

import { useActionState } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Input from "@modules/common/components/input"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import {
  requestPasswordReset,
  resetPasswordWithToken,
} from "@lib/data/customer"
import ErrorMessage from "@modules/checkout/components/error-message"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/* ── Step 1: Request a reset link (enter email) ── */
function RequestResetForm() {
  const [state, formAction] = useActionState(requestPasswordReset, null)
  const submitted = state?.success === true

  if (submitted) {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mx-auto mb-6">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-base-regular text-ui-fg-base mb-4">
          If an account exists with that email, you&apos;ll receive a password
          reset link shortly.
        </p>
        <p className="text-small-regular text-ui-fg-subtle mb-6">
          Please check your inbox and spam folder.
        </p>
        <LocalizedClientLink
          href="/account"
          className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover underline"
        >
          Back to sign in
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Enter your email address and we&apos;ll send you a link to reset your
        password.
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
            data-testid="reset-identifier-input"
          />
        </div>
        {state?.error && (
          <p className="text-rose-500 text-small-regular mt-2">
            {state.error}
          </p>
        )}
        <SubmitButton data-testid="reset-submit-button" className="w-full mt-6">
          Send reset link
        </SubmitButton>
      </form>
      <LocalizedClientLink
        href="/account"
        className="text-small-regular text-ui-fg-interactive hover:text-ui-fg-interactive-hover mt-6 inline-block"
      >
        Back to sign in
      </LocalizedClientLink>
    </>
  )
}

/* ── Step 2: Set new password (token from email link) ── */
function NewPasswordForm({ token, email }: { token: string; email: string }) {
  const [message, formAction] = useActionState(resetPasswordWithToken, "initial")
  const isSuccess = message === null

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mx-auto mb-6">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-base-regular text-ui-fg-base mb-4">
          Your password has been reset successfully!
        </p>
        <LocalizedClientLink
          href="/account"
          className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover underline"
        >
          Sign in with your new password
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Enter your new password below.
      </p>
      {typeof message === "string" && message !== "initial" && (
        <ErrorMessage error={message} data-testid="reset-error-message" />
      )}
      <form className="w-full" action={formAction}>
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="email" value={email} />
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="New Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            data-testid="new-password-input"
          />
          <Input
            label="Confirm Password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            data-testid="confirm-password-input"
          />
        </div>
        <SubmitButton data-testid="reset-password-button" className="w-full mt-6">
          Reset Password
        </SubmitButton>
      </form>
      <LocalizedClientLink
        href="/account"
        className="text-small-regular text-ui-fg-interactive hover:text-ui-fg-interactive-hover mt-6 inline-block"
      >
        Back to sign in
      </LocalizedClientLink>
    </>
  )
}

/* ── Router: show correct form based on query params ── */
function ResetPasswordRouter() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  if (token && email) {
    return <NewPasswordForm token={token} email={email} />
  }
  return <RequestResetForm />
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full flex justify-center px-8 py-12">
      <div className="max-w-sm w-full flex flex-col items-center">
        <h1 className="text-large-semi uppercase mb-6">Reset Password</h1>
        <Suspense
          fallback={
            <p className="text-ui-fg-subtle text-small-regular">Loading...</p>
          }
        >
          <ResetPasswordRouter />
        </Suspense>
      </div>
    </div>
  )
}
