/**
 * In-memory challenge store with automatic TTL expiry.
 * Used to temporarily hold WebAuthn registration/authentication challenges.
 */
const CHALLENGE_TTL_MS = 60_000 // 60 seconds

const store = new Map<string, { value: string; expires: number }>()

export function setChallenge(key: string, challenge: string): void {
  store.set(key, { value: challenge, expires: Date.now() + CHALLENGE_TTL_MS })
}

export function getChallenge(key: string): string | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expires) {
    store.delete(key)
    return null
  }
  store.delete(key) // single-use
  return entry.value
}

// Periodic cleanup of expired entries (every 5 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.expires) store.delete(key)
  }
}, 300_000)
