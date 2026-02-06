"use client"

import { useCallback, useEffect, useState } from "react"

export type ProductReview = {
  id: string
  productId: string
  author: string
  rating: number
  title: string
  body: string
  createdAt: number
}

const STORAGE_KEY = "letscase_reviews_v1"
const EVENT_NAME = "letscase:reviews"

function safeParse(json: string | null): ProductReview[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? (parsed as ProductReview[]) : []
  } catch {
    return []
  }
}

function readAll(): ProductReview[] {
  if (typeof window === "undefined") return []
  return safeParse(window.localStorage.getItem(STORAGE_KEY))
}

function writeAll(reviews: ProductReview[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews))
  window.dispatchEvent(new Event(EVENT_NAME))
}

export function useProductReviews(productId: string) {
  const [allReviews, setAllReviews] = useState<ProductReview[]>([])

  useEffect(() => {
    const update = () => setAllReviews(readAll())
    update()

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) update()
    }

    window.addEventListener("storage", onStorage)
    window.addEventListener(EVENT_NAME, update)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(EVENT_NAME, update)
    }
  }, [])

  const reviews = allReviews
    .filter((r) => r.productId === productId)
    .sort((a, b) => b.createdAt - a.createdAt)

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  const addReview = useCallback(
    (input: { author: string; rating: number; title: string; body: string }) => {
      const all = readAll()
      const review: ProductReview = {
        id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        productId,
        author: input.author,
        rating: input.rating,
        title: input.title,
        body: input.body,
        createdAt: Date.now(),
      }
      writeAll([review, ...all])
      return review
    },
    [productId]
  )

  const deleteReview = useCallback((reviewId: string) => {
    const all = readAll()
    writeAll(all.filter((r) => r.id !== reviewId))
  }, [])

  return { reviews, averageRating, ratingCounts, addReview, deleteReview, total: reviews.length }
}
