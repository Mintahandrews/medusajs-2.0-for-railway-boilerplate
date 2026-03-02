"use client"

import { useEffect, useState } from "react"
import { Cookie } from "lucide-react"

const COOKIE_CONSENT_KEY = "letscase_cookie_consent"
const COOKIE_PREFERENCES_KEY = "letscase_cookie_preferences"

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    functional: false,
  })

  useEffect(() => {
    // Only show if consent hasn't been given yet
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    const allAccepted = { ...preferences, analytics: true, marketing: true, functional: true }
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted")
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(allAccepted))
    setVisible(false)
    applyCookieSettings(allAccepted)
  }

  const handleDecline = () => {
    const minimalAccepted = { necessary: true, analytics: false, marketing: false, functional: false }
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined")
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(minimalAccepted))
    setVisible(false)
    applyCookieSettings(minimalAccepted)
  }

  const handleSavePreferences = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "custom")
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences))
    setVisible(false)
    setShowPreferences(false)
    applyCookieSettings(preferences)
  }

  const applyCookieSettings = (prefs: CookiePreferences) => {
    // Here you would typically integrate with your analytics/marketing tools
    // For now, we'll just store the preferences
    // Preferences stored — integrate analytics/marketing tools here as needed
  }

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return // Cannot disable necessary cookies
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] max-w-4xl mx-auto pointer-events-none">
      <div className="pointer-events-auto bg-white rounded-xl shadow-2xl border border-grey-20 overflow-hidden animate-cookie-slide-up">
        {!showPreferences ? (
          <>
            {/* Content */}
            <div className="p-6">
              <h3 className="text-[16px] font-bold text-grey-90 flex items-center gap-2">
                <Cookie className="w-5 h-5 text-yellow-500" aria-hidden="true" /> Cookie Preferences
              </h3>
              <p className="text-[14px] text-grey-50 mt-2 leading-relaxed">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                By clicking &ldquo;Accept All&rdquo;, you consent to our use of cookies.
                <br />
                <a href="/privacy-policy" className="font-semibold text-brand hover:text-brand-dark hover:underline">
                  Read our Privacy Policy
                </a>.
              </p>
            </div>

            {/* Buttons */}
            <div className="border-t border-grey-20 px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center gap-3 bg-grey-5">
              <button
                type="button"
                onClick={handleAccept}
                className="w-full sm:flex-1 h-12 sm:h-10 px-6 rounded-lg bg-brand text-white text-[14px] font-semibold hover:bg-brand-dark transition-colors"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={handleDecline}
                className="w-full sm:flex-1 h-12 sm:h-10 px-6 rounded-lg border border-grey-30 text-grey-60 text-[14px] font-semibold hover:bg-grey-10 transition-colors"
              >
                Reject All
              </button>
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="w-full sm:w-auto h-12 sm:h-10 px-6 rounded-lg border border-grey-30 text-grey-60 text-[14px] font-semibold hover:bg-grey-10 transition-colors"
              >
                Customize
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Preferences Panel */}
            <div className="p-6">
              <h3 className="text-[16px] font-bold text-grey-90 mb-4">Customize Cookie Preferences</h3>
              
              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="flex items-center justify-between p-3 bg-grey-5 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-grey-90 text-sm">Necessary Cookies</h4>
                    <p className="text-xs text-grey-50 mt-1">Required for the website to function properly</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={preferences.necessary}
                      disabled
                      className="sr-only"
                    />
                    <div className="w-12 h-6 bg-grey-30 rounded-full opacity-50"></div>
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"></div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between p-3 bg-grey-5 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-grey-90 text-sm">Analytics Cookies</h4>
                    <p className="text-xs text-grey-50 mt-1">Help us understand how visitors interact with our website</p>
                  </div>
                  <button
                    onClick={() => togglePreference("analytics")}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      preferences.analytics ? "bg-brand" : "bg-grey-30"
                    }`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      preferences.analytics ? "translate-x-6" : "translate-x-0.5"
                    }`}></div>
                  </button>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-center justify-between p-3 bg-grey-5 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-grey-90 text-sm">Marketing Cookies</h4>
                    <p className="text-xs text-grey-50 mt-1">Used to deliver personalized advertisements</p>
                  </div>
                  <button
                    onClick={() => togglePreference("marketing")}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      preferences.marketing ? "bg-brand" : "bg-grey-30"
                    }`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      preferences.marketing ? "translate-x-6" : "translate-x-0.5"
                    }`}></div>
                  </button>
                </div>

                {/* Functional Cookies */}
                <div className="flex items-center justify-between p-3 bg-grey-5 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-grey-90 text-sm">Functional Cookies</h4>
                    <p className="text-xs text-grey-50 mt-1">Enable enhanced functionality and personalization</p>
                  </div>
                  <button
                    onClick={() => togglePreference("functional")}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      preferences.functional ? "bg-brand" : "bg-grey-30"
                    }`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      preferences.functional ? "translate-x-6" : "translate-x-0.5"
                    }`}></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Preferences Buttons */}
            <div className="border-t border-grey-20 px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center gap-3 bg-grey-5">
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="w-full sm:w-auto h-12 sm:h-10 px-6 rounded-lg border border-grey-30 text-grey-60 text-[14px] font-semibold hover:bg-grey-10 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="w-full sm:flex-1 h-12 sm:h-10 px-6 rounded-lg bg-brand text-white text-[14px] font-semibold hover:bg-brand-dark transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
