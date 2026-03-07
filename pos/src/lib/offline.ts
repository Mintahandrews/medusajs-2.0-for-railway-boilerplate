"use client"

/**
 * Offline Queue — IndexedDB-backed order queue for offline POS operation.
 * Queues orders when the network is unavailable and syncs when reconnected.
 */

const DB_NAME = "letscase-pos-offline"
const DB_VERSION = 1
const STORE_NAME = "pending-orders"

interface PendingOrder {
  id: string
  payload: any
  createdAt: string
  retries: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function queueOrder(payload: any): Promise<string> {
  const db = await openDB()
  const id = `offline-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const entry: PendingOrder = {
    id,
    payload,
    createdAt: new Date().toISOString(),
    retries: 0,
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).put(entry)
    tx.oncomplete = () => resolve(id)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPendingOrders(): Promise<PendingOrder[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const req = tx.objectStore(STORE_NAME).getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
}

export async function removePendingOrder(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPendingCount(): Promise<number> {
  const orders = await getPendingOrders()
  return orders.length
}

/**
 * Sync all pending orders. Calls the provided `syncFn` for each order.
 * Returns the number of successfully synced orders.
 */
export async function syncPendingOrders(
  syncFn: (payload: any) => Promise<void>,
  onProgress?: (synced: number, total: number) => void
): Promise<number> {
  const orders = await getPendingOrders()
  if (!orders.length) return 0

  let synced = 0
  for (const order of orders) {
    try {
      await syncFn(order.payload)
      await removePendingOrder(order.id)
      synced++
      onProgress?.(synced, orders.length)
    } catch {
      // Leave in queue for next sync attempt
    }
  }
  return synced
}

/**
 * Hook-friendly online status detection.
 */
export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true
}
