"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

export type WishlistItem = {
  id: string
  handle: string
  title: string
  image?: string | null
  price?: string
}

const STORAGE_KEY = "letscase_wishlist_v1"
const EVENT_NAME = "letscase:wishlist"

function safeParse(json: string | null): WishlistItem[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? (parsed as WishlistItem[]) : []
  } catch {
    return []
  }
}

function readWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return []
  return safeParse(window.localStorage.getItem(STORAGE_KEY))
}

function writeWishlist(items: WishlistItem[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event(EVENT_NAME))
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([])

  useEffect(() => {
    const update = () => setItems(readWishlist())

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

  const indexById = useMemo(() => {
    const map = new Map<string, number>()
    items.forEach((it, idx) => map.set(it.id, idx))
    return map
  }, [items])

  const isInWishlist = useCallback(
    (id: string) => indexById.has(id),
    [indexById]
  )

  const add = useCallback((item: WishlistItem) => {
    const current = readWishlist()
    const existingIdx = current.findIndex((x) => x.id === item.id)
    if (existingIdx >= 0) return
    writeWishlist([item, ...current])
  }, [])

  const remove = useCallback((id: string) => {
    const current = readWishlist()
    writeWishlist(current.filter((x) => x.id !== id))
  }, [])

  const toggle = useCallback((item: WishlistItem) => {
    const current = readWishlist()
    const existingIdx = current.findIndex((x) => x.id === item.id)
    if (existingIdx >= 0) {
      writeWishlist(current.filter((x) => x.id !== item.id))
      return
    }
    writeWishlist([item, ...current])
  }, [])

  const clear = useCallback(() => {
    writeWishlist([])
  }, [])

  return { items, add, remove, toggle, clear, isInWishlist }
}
