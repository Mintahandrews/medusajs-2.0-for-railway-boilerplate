"use client"

import { CheckCircle2, Store, Truck } from "lucide-react"
import { Heading, Text, clx } from "@medusajs/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { RadioGroup } from "@headlessui/react"

import Divider from "@modules/common/components/divider"
import Spinner from "@modules/common/icons/spinner"

import { setAddresses } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { useActionState, useState } from "react"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"

  const [deliveryOption, setDeliveryOption] = useState<"delivery" | "pickup">("delivery")

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
        >
          Delivery info
          {!isOpen && <CheckCircle2 size={20} className="text-green-500" />}
        </Heading>
        {!isOpen && cart?.shipping_address && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-address-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      {isOpen ? (
        <form action={formAction}>
          <div className="pb-8">
            <input type="hidden" name="delivery_option" value={deliveryOption} />

            <div className="mb-8 mt-4">
              <RadioGroup value={deliveryOption} onChange={setDeliveryOption}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <RadioGroup.Option
                    value="delivery"
                    className={({ checked }) =>
                      clx(
                        "relative flex items-center gap-3 cursor-pointer p-4 border rounded-xl transition-all",
                        checked
                          ? "border-brand bg-brand-50/50"
                          : "border-ui-border-base bg-white hover:border-brand-300"
                      )
                    }
                  >
                    {({ checked }) => (
                      <>
                        <div
                          className={clx(
                            "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
                            checked ? "bg-brand-100 text-brand-600" : "bg-grey-10 text-grey-40"
                          )}
                        >
                          <Truck size={18} />
                        </div>
                        <div className="flex-1">
                          <p className={clx("text-base font-medium", checked ? "text-brand-900" : "text-ui-fg-base")}>
                            Delivery
                          </p>
                          <p className="text-sm text-ui-fg-subtle">We&apos;ll deliver to your address</p>
                        </div>
                      </>
                    )}
                  </RadioGroup.Option>

                  <RadioGroup.Option
                    value="pickup"
                    className={({ checked }) =>
                      clx(
                        "relative flex items-center gap-3 cursor-pointer p-4 border rounded-xl transition-all",
                        checked
                          ? "border-brand bg-brand-50/50"
                          : "border-ui-border-base bg-white hover:border-brand-300"
                      )
                    }
                  >
                    {({ checked }) => (
                      <>
                        <div
                          className={clx(
                            "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
                            checked ? "bg-brand-100 text-brand-600" : "bg-grey-10 text-grey-40"
                          )}
                        >
                          <Store size={18} />
                        </div>
                        <div className="flex-1">
                          <p className={clx("text-base font-medium", checked ? "text-brand-900" : "text-ui-fg-base")}>
                            Pickup
                          </p>
                          <p className="text-sm text-ui-fg-subtle">Collect from our shop</p>
                        </div>
                      </>
                    )}
                  </RadioGroup.Option>
                </div>
              </RadioGroup>
            </div>

            {deliveryOption === "delivery" ? (
              <>
                <ShippingAddress
                  customer={customer}
                  cart={cart}
                />
              </>
            ) : (
              <div className="p-6 border border-ui-border-base rounded-xl bg-ui-bg-subtle mb-6">
                <Heading level="h3" className="mb-2 text-xl-semi text-ui-fg-base">Letscase Display Suite</Heading>
                <div className="flex flex-col gap-1 text-ui-fg-subtle">
                  <Text>Neoplan, New Achimota</Text>
                  <Text>Accra, Ghana</Text>
                  <Text className="mt-2 font-medium">Contact: 054 045 1001</Text>
                  <Text className="text-small-regular text-ui-fg-muted">letscasegh@gmail.com</Text>
                  <Text className="text-small-regular mt-2">Available for pickup during regular business hours (8 AM - 8 PM).</Text>
                </div>
              </div>
            )}

            <SubmitButton className="mt-6" data-testid="submit-address-button">
              Continue to payment
            </SubmitButton>
            <ErrorMessage error={message} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && cart.shipping_address ? (
              <div className="grid grid-cols-1 small:grid-cols-3 gap-8">
                <div
                  className="flex flex-col"
                  data-testid="shipping-address-summary"
                >
                    <Text className="txt-medium-plus text-ui-fg-base mb-1">
                      Delivery info
                    </Text>
                    {cart.shipping_address.first_name === "Pickup" ? (
                      <>
                        <Text className="txt-medium text-ui-fg-subtle">
                          In-store Pickup
                        </Text>
                        <Text className="txt-medium text-ui-fg-subtle">
                          Letscase Display Suite
                        </Text>
                        <Text className="txt-medium text-ui-fg-subtle">
                          Neoplan, New Achimota, Accra
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.shipping_address.first_name}{" "}
                          {cart.shipping_address.last_name}
                        </Text>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.shipping_address.address_1}{" "}
                          {cart.shipping_address.address_2}
                        </Text>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.shipping_address.postal_code},{" "}
                          {cart.shipping_address.city}
                        </Text>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.shipping_address.country_code?.toUpperCase()}
                        </Text>
                      </>
                    )}
                </div>

                <div
                  className="flex flex-col"
                  data-testid="shipping-contact-summary"
                >
                    <Text className="txt-medium-plus text-ui-fg-base mb-1">
                      Contact
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.shipping_address.phone}
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.email}
                    </Text>
                </div>

              </div>
            ) : (
              <div>
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Addresses
