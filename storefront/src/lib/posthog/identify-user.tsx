"use client"

import { useEffect } from "react"
import { identifyUser, resetUser } from "./events"

type Props = {
  customer: {
    id: string
    email?: string | null
    first_name?: string | null
    last_name?: string | null
  } | null
}

export default function PostHogIdentifyUser({ customer }: Props) {
  useEffect(() => {
    if (customer?.id) {
      identifyUser(customer.id, {
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
      })
    } else {
      resetUser()
    }
  }, [customer])

  return null
}
