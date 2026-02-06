"use client"

import { useEffect } from "react"
import { trackRecentlyViewed } from "@lib/hooks/use-recently-viewed"

type Props = {
  productId: string
  handle: string
  title: string
  thumbnail: string | null
}

export default function RecentlyViewedTracker({
  productId,
  handle,
  title,
  thumbnail,
}: Props) {
  useEffect(() => {
    trackRecentlyViewed({ id: productId, handle, title, thumbnail })
  }, [productId, handle, title, thumbnail])

  return null
}
