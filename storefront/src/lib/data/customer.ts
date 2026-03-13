"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { cache } from "react"
import { getAuthHeaders, removeAuthToken, setAuthToken } from "./cookies"
import {
  isPhoneNumber,
  phoneToSyntheticEmail,
  sendWelcomeSMS,
} from "@lib/sms"

export const getCustomer = cache(async function () {
  try {
    return await sdk.store.customer
      .retrieve({}, { next: { tags: ["customer"] }, ...(await getAuthHeaders()) })
      .then(({ customer }) => customer)
  } catch {
    // 401 for unauthenticated users is expected — return null silently
    return null
  }
})

export const updateCustomer = cache(async function (
  body: HttpTypes.StoreUpdateCustomer
) {
  const updateRes = await sdk.store.customer
    .update(body, {}, await getAuthHeaders())
    .then(({ customer }) => customer)
    .catch(medusaError)

  revalidateTag("customer")
  return updateRes
})

export async function signup(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  const rawEmail = ((formData.get("email") as string) || "").trim()
  const rawPhone = ((formData.get("phone") as string) || "").trim()
  const firstName = ((formData.get("first_name") as string) || "").trim()
  const lastName = ((formData.get("last_name") as string) || "").trim()

  // Require at least one of email or phone
  if (!rawEmail && !rawPhone) {
    return "Please provide either an email address or phone number."
  }

  // If only phone provided, generate a synthetic email for Medusa auth
  const authEmail = rawEmail || phoneToSyntheticEmail(rawPhone)

  const customerForm = {
    email: authEmail,
    first_name: firstName,
    last_name: lastName,
    phone: rawPhone,
  }

  // Optional shipping address fields from registration
  const addressLine1 = formData.get("address_1") as string
  const city = formData.get("city") as string
  const countryCode = formData.get("country_code") as string

  try {
    const token = await sdk.auth.register("customer", "emailpass", {
      email: authEmail,
      password: password,
    })

    if (typeof token !== "string") {
      throw new Error("Unexpected auth response")
    }

    const customHeaders = { authorization: `Bearer ${token}` }
    
    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      customHeaders
    )

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: authEmail,
      password,
    })

    if (typeof loginToken !== "string") {
      throw new Error("Unexpected auth response")
    }

    await setAuthToken(loginToken)

    // Send welcome SMS if phone number was provided
    if (rawPhone) {
      sendWelcomeSMS(rawPhone, firstName || "there").catch((err) =>
        console.warn("[signup] Welcome SMS failed:", err)
      )
    }

    // Save shipping address if provided during registration
    if (addressLine1 && city && countryCode) {
      try {
        const authHeaders = { authorization: `Bearer ${loginToken}` }
        await sdk.store.customer.createAddress(
          {
            first_name: customerForm.first_name,
            last_name: customerForm.last_name,
            address_1: addressLine1,
            address_2: (formData.get("address_2") as string) || "",
            city,
            postal_code: (formData.get("postal_code") as string) || "",
            province: (formData.get("province") as string) || "",
            country_code: countryCode,
            phone: customerForm.phone || "",
            company: (formData.get("company") as string) || "",
          },
          {},
          authHeaders
        )
      } catch (addrErr) {
        // Non-critical — account is created, address can be added later
        console.warn("[signup] Failed to save address:", addrErr)
      }
    }

    revalidateTag("customer")
    return null
  } catch (error: any) {
    return error.toString()
  }
}

export async function login(_currentState: unknown, formData: FormData) {
  const identifier = ((formData.get("identifier") as string) || "").trim()
  const password = formData.get("password") as string

  if (!identifier) {
    return "Please enter your email or phone number."
  }

  // Detect if user entered a phone number or email
  const authEmail = isPhoneNumber(identifier)
    ? phoneToSyntheticEmail(identifier)
    : identifier

  try {
    await sdk.auth
      .login("customer", "emailpass", { email: authEmail, password })
      .then(async (token) => {
        if (typeof token !== "string") {
          throw new Error("Unexpected auth response")
        }

        await setAuthToken(token)
        revalidateTag("customer")
      })
  } catch (error: any) {
    return error.toString()
  }
}

export async function signout(countryCode: string) {
  await sdk.auth.logout()
  await removeAuthToken()
  revalidateTag("auth")
  revalidateTag("customer")
  redirect(`/${countryCode}/account`)
}

export const addCustomerAddress = async (
  _currentState: unknown,
  formData: FormData
): Promise<any> => {
  const fullName = (formData.get("full_name") as string || "").trim()
  const nameParts = fullName.split(/\s+/)
  const address = {
    first_name: nameParts[0] || (formData.get("first_name") as string) || "",
    last_name: nameParts.slice(1).join(" ") || (formData.get("last_name") as string) || "",
    company: "",
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
  }

  return sdk.store.customer
    .createAddress(address, {}, await getAuthHeaders())
    .then(({ customer }) => {
      revalidateTag("customer")
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  await sdk.store.customer
    .deleteAddress(addressId, await getAuthHeaders())
    .then(() => {
      revalidateTag("customer")
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const addressId = currentState.addressId as string

  const fullName = (formData.get("full_name") as string || "").trim()
  const nameParts = fullName.split(/\s+/)
  const address = {
    first_name: nameParts[0] || (formData.get("first_name") as string) || "",
    last_name: nameParts.slice(1).join(" ") || (formData.get("last_name") as string) || "",
    company: "",
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, await getAuthHeaders())
    .then(() => {
      revalidateTag("customer")
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}
