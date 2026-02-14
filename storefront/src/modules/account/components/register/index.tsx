"use client"

import { useState } from "react"
import { useFormState } from "react-dom"
import { ChevronDown, ChevronUp, MapPin } from "lucide-react"

import Input from "@modules/common/components/input"
import GPSLocationButton, { type AddressFromGPS } from "@modules/common/components/gps-location-button"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useFormState(signup, null)
  const [showAddress, setShowAddress] = useState(false)
  const [addressFields, setAddressFields] = useState({
    address_1: "",
    address_2: "",
    city: "",
    postal_code: "",
    province: "",
    country_code: "",
  })

  function handleGPSAddress(addr: AddressFromGPS) {
    setAddressFields({
      address_1: addr.address_1,
      address_2: addr.address_2,
      city: addr.city,
      postal_code: addr.postal_code,
      province: addr.province,
      country_code: addr.country_code,
    })
    if (!showAddress) setShowAddress(true)
  }

  function handleAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAddressFields((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        Become a Letscase Member
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        Create your Letscase profile, and get access to an enhanced shopping
        experience.
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="First name"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>

        {/* Shipping Address — optional, collapsible */}
        <div className="mt-4 border border-ui-border-base rounded-md overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAddress(!showAddress)}
            className="w-full flex items-center justify-between px-4 py-3 bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover transition-colors"
          >
            <span className="flex items-center gap-2 text-small-regular text-ui-fg-base font-medium">
              <MapPin size={16} />
              Add Shipping Address
            </span>
            {showAddress ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showAddress && (
            <div className="flex flex-col gap-y-3 p-4 pt-3">
              <p className="text-ui-fg-subtle text-xsmall-regular mb-2">
                Save your shipping address now so it auto-fills at checkout.
              </p>
              <GPSLocationButton
                onAddressResolved={handleGPSAddress}
                label="Use My GPS Location"
                className="w-full"
              />
              <Input
                label="Address"
                name="address_1"
                autoComplete="address-line1"
                value={addressFields.address_1}
                onChange={handleAddressChange}
                data-testid="address-input"
              />
              <Input
                label="Apartment, suite, etc. (optional)"
                name="address_2"
                autoComplete="address-line2"
                value={addressFields.address_2}
                onChange={handleAddressChange}
                data-testid="address-2-input"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City"
                  name="city"
                  autoComplete="address-level2"
                  value={addressFields.city}
                  onChange={handleAddressChange}
                  data-testid="city-input"
                />
                <Input
                  label="GPS Address"
                  name="postal_code"
                  autoComplete="postal-code"
                  value={addressFields.postal_code}
                  onChange={handleAddressChange}
                  data-testid="postal-code-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Region"
                  name="province"
                  autoComplete="address-level1"
                  value={addressFields.province}
                  onChange={handleAddressChange}
                  data-testid="province-input"
                />
                <Input
                  label="Country (e.g. GH)"
                  name="country_code"
                  autoComplete="country"
                  value={addressFields.country_code}
                  onChange={handleAddressChange}
                  data-testid="country-code-input"
                />
              </div>
            </div>
          )}
        </div>

        <ErrorMessage error={message} data-testid="register-error" />
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          By creating an account, you agree to Letscase&apos;s{" "}
          <LocalizedClientLink
            href="/privacy-policy"
            className="underline"
          >
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/terms-and-conditions"
            className="underline"
          >
            Terms of Use
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          Join
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Already a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Sign in
        </button>
        .
      </span>
    </div>
  )
}

export default Register
