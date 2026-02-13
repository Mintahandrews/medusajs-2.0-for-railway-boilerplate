"use client"

import { useEffect, useState } from "react"

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
    console.log("Cookie preferences applied:", prefs)
  }

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return // Cannot disable necessary cookies
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] max-w-4xl mx-auto pointer-events-none">
      <div className="pointer-events-auto bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-up">
        {!showPreferences ? (
          <>
            {/* Content */}
            <div className="p-6">
              <h3 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
                <span className="text-lg">🍪</span> Cookie Preferences
              </h3>
              <p className="text-[14px] text-gray-600 mt-2 leading-relaxed">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                By clicking "Accept All", you consent to our use of cookies.
                <br />
                <a href="/privacy-policy" className="font-semibold text-blue-600 hover:underline">
                  Read our Privacy Policy
                </a>.
              </p>
            </div>

            {/* Buttons */}
            <div className="border-t border-gray-200 px-6 py-4 flex items-center gap-3 bg-gray-50">
              <button
                type="button"
                onClick={handleAccept}
                className="flex-1 h-10 px-6 rounded-lg bg-blue-600 text-white text-[14px] font-semibold hover:bg-blue-700 transition-colors"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={handleDecline}
                className="flex-1 h-10 px-6 rounded-lg border border-gray-300 text-gray-700 text-[14px] font-semibold hover:bg-gray-100 transition-colors"
              >
                Reject All
              </button>
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="h-10 px-6 rounded-lg border border-gray-300 text-gray-700 text-[14px] font-semibold hover:bg-gray-100 transition-colors"
              >
                Customize
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Preferences Panel */}
            <div className="p-6">
              <h3 className="text-[16px] font-bold text-gray-900 mb-4">Customize Cookie Preferences</h3>
              
              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Necessary Cookies</h4>
                    <p className="text-xs text-gray-600 mt-1">Required for the website to function properly</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={preferences.necessary}
                      disabled
                      className="sr-only"
                    />
                    <div className="w-12 h-6 bg-gray-300 rounded-full opacity-50"></div>
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"></div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Analytics Cookies</h4>
                    <p className="text-xs text-gray-600 mt-1">Help us understand how visitors interact with our website</p>
                  </div>
                  <button
                    onClick={() => togglePreference("analytics")}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      preferences.analytics ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      preferences.analytics ? "translate-x-6" : "translate-x-0.5"
                    }`}></div>
                  </button>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Marketing Cookies</h4>
                    <p className="text-xs text-gray-600 mt-1">Used to deliver personalized advertisements</p>
                  </div>
                  <button
                    onClick={() => togglePreference("marketing")}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      preferences.marketing ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      preferences.marketing ? "translate-x-6" : "translate-x-0.5"
                    }`}></div>
                  </button>
                </div>

                {/* Functional Cookies */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Functional Cookies</h4>
                    <p className="text-xs text-gray-600 mt-1">Enable enhanced functionality and personalization</p>
                  </div>
                  <button
                    onClick={() => togglePreference("functional")}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      preferences.functional ? "bg-blue-600" : "bg-gray-300"
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
            <div className="border-t border-gray-200 px-6 py-4 flex items-center gap-3 bg-gray-50">
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="h-10 px-6 rounded-lg border border-gray-300 text-gray-700 text-[14px] font-semibold hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="flex-1 h-10 px-6 rounded-lg bg-blue-600 text-white text-[14px] font-semibold hover:bg-blue-700 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </>
        )}

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slide-up 0.4s ease-out;
          }
        `}} />
      </div>
    </div>
  )
}
