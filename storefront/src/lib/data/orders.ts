"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { cache } from "react"
import { getAuthHeaders } from "./cookies"

export const retrieveOrder = cache(async function (id: string) {
  // If id is a number (display_id), find the order by display_id first
  if (/^\d+$/.test(id)) {
    const orders = await sdk.store.order
      .list(
        { limit: 1, offset: 0 },
        { next: { tags: ["order"] }, ...(await getAuthHeaders()) }
      )
      .then(({ orders }) => orders)
      .catch(() => [])
    
    // Search for order with matching display_id
    const allOrders = await sdk.store.order
      .list(
        { limit: 100, offset: 0 },
        { next: { tags: ["order"] }, ...(await getAuthHeaders()) }
      )
      .then(({ orders }) => orders)
      .catch(() => [])
    
    const order = allOrders.find((o) => String(o.display_id) === id)
    if (order) {
      id = order.id
    }
  }

  return sdk.store.order
    .retrieve(
      id,
      { fields: "*payment_collections.payments" },
      { next: { tags: ["order"] }, ...(await getAuthHeaders()) }
    )
    .then(({ order }) => order)
    .catch((err) => medusaError(err))
})

export const listOrders = cache(async function (
  limit: number = 10,
  offset: number = 0
) {
  return sdk.store.order
    .list(
      { limit, offset },
      { next: { tags: ["order"] }, ...(await getAuthHeaders()) }
    )
    .then(({ orders }) => orders)
    .catch((err) => medusaError(err))
})
