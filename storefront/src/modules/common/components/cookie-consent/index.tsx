"use client"

import { useEffect, useState } from "react"

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
    <div className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-none">
      <div className="pointer-events-auto w-full bg-[#2a2a2e] shadow-[0_-4px_24px_rgba(0,0,0,0.3)] animate-slide-up">
        {/* Content */}
        <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-5 pb-4">
          <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
            <span className="text-lg">🍪</span> Yes, we use cookies
          </h3>
          <p className="text-[13px] text-gray-400 mt-2 leading-relaxed max-w-2xl">
            This website utilizes cookies to enable essential site functionality and analytics.
            You may change your settings at any time or accept the default settings. You may close
            this banner to continue with only essential cookies.
            <br />
            Read more about this in our{" "}
            <a href="/privacy" className="font-bold text-white hover:underline">
              privacy and cookie statement
            </a>.
          </p>
        </div>

        {/* Buttons bar */}
        <div className="border-t border-white/10">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-3.5 flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleAccept}
              className="h-10 px-6 rounded-md bg-emerald-500 text-white text-[13px] font-bold hover:bg-emerald-600 transition"
            >
              Accept all
            </button>
            <button
              type="button"
              onClick={handleDecline}
              className="h-10 px-6 rounded-md bg-emerald-500 text-white text-[13px] font-bold hover:bg-emerald-600 transition"
            >
              Reject all
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={handleDecline}
              className="h-10 px-6 rounded-md border border-gray-500 text-gray-300 text-[13px] font-semibold hover:border-gray-400 hover:text-white transition"
            >
              Manage preferences
            </button>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(100%); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slide-up 0.35s ease-out;
          }
        `}} />
      </div>
    </div>
  )
}
