"use client"

import { useEffect } from "react"
import { trackCheckoutCompleted } from "./events"

type Props = {
  order: {
    id: string
    total?: number
    items?: any[]
  }
}

export default function TrackOrderCompleted({ order }: Props) {
  useEffect(() => {
    if (order?.id) {
      trackCheckoutCompleted({
        id: order.id,
        total: order.total,
        items_count: order.items?.length,
      })
    }
  }, [order])

  return null
}
