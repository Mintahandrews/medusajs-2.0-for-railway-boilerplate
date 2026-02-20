"use client"

import { useEffect } from "react"
import { trackProductViewed } from "./events"

type Props = {
  product: {
    id: string
    title: string
    handle?: string
    thumbnail?: string | null
    collection?: { title: string } | null
  }
  price?: string
}

export default function TrackProductView({ product, price }: Props) {
  useEffect(() => {
    if (product?.id) {
      trackProductViewed({ ...product, price })
    }
  }, [product, price])

  return null
}
