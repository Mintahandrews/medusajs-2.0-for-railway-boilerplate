import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "GHS"): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function generateReceiptNumber(): string {
  const now = new Date()
  const date = now.toISOString().slice(2, 10).replace(/-/g, "")
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `POS-${date}-${rand}`
}

export function playBeep() {
  if (typeof window === "undefined") return
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 1200
    gain.gain.value = 0.1
    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  } catch {
    // silent fail
  }
}

/**
 * Play a loud, distinctive success chime for completed purchases.
 * Three ascending tones at high volume.
 */
export function playPurchaseSuccess() {
  if (typeof window === "undefined") return
  try {
    const ctx = new AudioContext()

    const notes = [
      { freq: 523.25, start: 0, duration: 0.15 },    // C5
      { freq: 659.25, start: 0.15, duration: 0.15 },  // E5
      { freq: 783.99, start: 0.30, duration: 0.3 },   // G5 (held longer)
    ]

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.35, ctx.currentTime + start)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + duration)
    })
  } catch {
    // silent fail
  }
}
