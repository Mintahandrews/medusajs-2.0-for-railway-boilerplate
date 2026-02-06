"use client"

import { useEffect, useState } from "react"
import { Cookie, X } from "lucide-react"

const COOKIE_CONSENT_KEY = "letscase_cookie_consent"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

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
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted")
    setVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 sm:p-6 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 sm:p-6 animate-slide-up">
        {/* Close button */}
        <button
          type="button"
          onClick={handleDecline}
          className="absolute top-3 right-3 h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>

        <div className="flex gap-4 items-start">
          {/* Cookie icon */}
          <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Cookie size={20} className="text-amber-500" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-gray-900">We use cookies</h3>
            <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
              We use cookies to improve your experience, remember your preferences, and analyze site traffic. By clicking &quot;Accept&quot;, you consent to our use of cookies.
            </p>

            <div className="flex items-center gap-2.5 mt-4">
              <button
                type="button"
                onClick={handleAccept}
                className="h-9 px-5 rounded-xl bg-black text-white text-[13px] font-bold hover:bg-gray-800 transition"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={handleDecline}
                className="h-9 px-5 rounded-xl border border-gray-200 text-gray-600 text-[13px] font-semibold hover:bg-gray-50 hover:border-gray-300 transition"
              >
                Decline
              </button>
            </div>
          </div>
        </div>

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
