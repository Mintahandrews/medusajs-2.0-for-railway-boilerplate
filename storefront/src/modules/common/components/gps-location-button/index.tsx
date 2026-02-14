"use client"

import React, { useState, useRef, useCallback } from "react"
import { MapPin, Loader2 } from "lucide-react"

export interface AddressFromGPS {
  address_1: string
  address_2: string
  city: string
  province: string
  postal_code: string
  country_code: string
}

interface Props {
  /** Called when the GPS address is resolved */
  onAddressResolved: (address: AddressFromGPS) => void
  /** Optional label text */
  label?: string
  /** Optional className for the button */
  className?: string
}

/** In-memory geocode cache so repeat clicks are instant */
const geocodeCache = new Map<string, AddressFromGPS>()

/** Round coords to ~110 m grid so nearby positions share cache */
function cacheKey(lat: number, lon: number) {
  return `${lat.toFixed(3)},${lon.toFixed(3)}`
}

function parseNominatim(
  addr: Record<string, string>,
  latitude: number,
  longitude: number
): AddressFromGPS {
  const road = addr.road || addr.pedestrian || addr.footway || ""
  const houseNumber = addr.house_number || ""
  const neighbourhood =
    addr.neighbourhood || addr.suburb || addr.quarter || ""
  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.county ||
    ""
  const province = addr.state || addr.region || addr.state_district || ""
  const countryCode = (addr.country_code || "").toLowerCase()

  // Postal code: use Nominatim postcode or GPS-based digital address
  let postalCode = addr.postcode || ""
  if (!postalCode) {
    postalCode = `GPS-${latitude.toFixed(4)},${longitude.toFixed(4)}`
  }

  // Build address_1 with neighbourhood for completeness
  let addressLine1 = houseNumber ? `${houseNumber} ${road}`.trim() : road
  if (neighbourhood && !addressLine1.includes(neighbourhood)) {
    addressLine1 = addressLine1
      ? `${addressLine1}, ${neighbourhood}`
      : neighbourhood
  }

  return {
    address_1: addressLine1,
    address_2: neighbourhood,
    city,
    province,
    postal_code: postalCode,
    country_code: countryCode,
  }
}

/**
 * GPS location button that uses the browser's Geolocation API
 * and OpenStreetMap Nominatim for reverse geocoding.
 * Works on mobile and desktop browsers.
 *
 * Performance optimisations:
 * - First attempt uses fast Wi-Fi / cell position (enableHighAccuracy: false)
 *   with a short 5 s timeout, then falls back to high-accuracy GPS.
 * - In-memory geocode cache keyed to ~110 m grid avoids repeat network calls.
 * - maximumAge 2 min so the browser can reuse a recent fix.
 * - AbortController cancels duplicate clicks.
 */
export default function GPSLocationButton({
  onAddressResolved,
  label = "Use My Location",
  className = "",
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const abortRef = useRef<AbortController | null>(null)

  /** Try to get a position — fast first, then high-accuracy fallback */
  const getPosition = useCallback(async (): Promise<GeolocationPosition> => {
    // Fast attempt: network / Wi-Fi triangulation (usually < 2 s)
    try {
      return await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 120000, // 2 min cache
        })
      })
    } catch {
      // Fall back to high-accuracy GPS
      return new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 120000,
        })
      })
    }
  }, [])

  const handleGetLocation = useCallback(async () => {
    // Cancel any in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError("")

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setLoading(false)
      return
    }

    try {
      const position = await getPosition()
      if (controller.signal.aborted) return

      const { latitude, longitude } = position.coords
      const key = cacheKey(latitude, longitude)

      // Return cached result instantly if available
      const cached = geocodeCache.get(key)
      if (cached) {
        onAddressResolved(cached)
        setLoading(false)
        return
      }

      // Reverse geocode using OpenStreetMap Nominatim (free, no API key)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`,
        {
          headers: { "User-Agent": "LetsCaseGH-Storefront/1.0" },
          signal: controller.signal,
        }
      )

      if (!res.ok) throw new Error("Could not determine your address")

      const data = await res.json()
      const address = parseNominatim(data.address || {}, latitude, longitude)

      // Cache for instant reuse
      geocodeCache.set(key, address)

      if (!controller.signal.aborted) {
        onAddressResolved(address)
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return
      if (err?.code === 1) {
        setError("Location access denied. Please enable location permissions.")
      } else if (err?.code === 2) {
        setError("Location unavailable. Please try again.")
      } else if (err?.code === 3) {
        setError("Location request timed out. Please try again.")
      } else {
        setError(err?.message || "Could not get your location")
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [getPosition, onAddressResolved])

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleGetLocation}
        disabled={loading}
        className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
          border border-brand/30 bg-brand/5 text-brand text-sm font-medium
          hover:bg-brand/10 active:scale-[0.98] transition-all
          disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Locating…
          </>
        ) : (
          <>
            <MapPin size={16} />
            {label}
          </>
        )}
      </button>
      {error && (
        <p className="text-[11px] text-red-500 px-1">{error}</p>
      )}
    </div>
  )
}
