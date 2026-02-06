"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

export type RecentlyViewedItem = {
  id: string
  handle: string
  title: string
  thumbnail: string | null
  viewedAt: number
}

const STORAGE_KEY = "letscase_recently_viewed_v1"
const EVENT_NAME = "letscase:recently_viewed"
const MAX_ITEMS = 12

function safeParse(json: string | null): RecentlyViewedItem[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? (parsed as RecentlyViewedItem[]) : []
  } catch {
    return []
  }
}

function read(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return []
  return safeParse(window.localStorage.getItem(STORAGE_KEY))
}

function write(items: RecentlyViewedItem[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event(EVENT_NAME))
}

export function trackRecentlyViewed(item: Omit<RecentlyViewedItem, "viewedAt">) {
  const current = read()
  const filtered = current.filter((x) => x.id !== item.id)
  const updated: RecentlyViewedItem[] = [
    { ...item, viewedAt: Date.now() },
    ...filtered,
  ].slice(0, MAX_ITEMS)
  write(updated)
}

export function useRecentlyViewed(excludeId?: string) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([])

  useEffect(() => {
    const update = () => setItems(read())

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

  const filtered = useMemo(() => {
    if (!excludeId) return items
    return items.filter((i) => i.id !== excludeId)
  }, [items, excludeId])

  const clear = useCallback(() => write([]), [])

  return { items: filtered, clear }
}
