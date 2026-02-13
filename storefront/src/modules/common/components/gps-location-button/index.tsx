"use client"

import React, { useState } from "react"
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

/**
 * GPS location button that uses the browser's Geolocation API
 * and OpenStreetMap Nominatim for reverse geocoding.
 * Works on mobile and desktop browsers.
 */
export default function GPSLocationButton({
  onAddressResolved,
  label = "Use My Location",
  className = "",
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleGetLocation() {
    setLoading(true)
    setError("")

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setLoading(false)
      return
    }

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000,
          })
        }
      )

      const { latitude, longitude } = position.coords

      // Reverse geocode using OpenStreetMap Nominatim (free, no API key)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`,
        {
          headers: {
            "User-Agent": "LetsCaseGH-Storefront/1.0",
          },
        }
      )

      if (!res.ok) {
        throw new Error("Could not determine your address")
      }

      const data = await res.json()
      const addr = data.address || {}

      // Map Nominatim fields to our address format
      const road = addr.road || addr.pedestrian || addr.footway || ""
      const houseNumber = addr.house_number || ""
      const neighbourhood = addr.neighbourhood || addr.suburb || addr.quarter || ""
      const city =
        addr.city || addr.town || addr.village || addr.municipality || addr.county || ""
      const province =
        addr.state || addr.region || addr.state_district || ""
      const postalCode = addr.postcode || ""
      const countryCode = (addr.country_code || "").toLowerCase()

      const address: AddressFromGPS = {
        address_1: houseNumber ? `${houseNumber} ${road}`.trim() : road,
        address_2: neighbourhood,
        city,
        province,
        postal_code: postalCode,
        country_code: countryCode,
      }

      onAddressResolved(address)
    } catch (err: any) {
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
      setLoading(false)
    }
  }

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
