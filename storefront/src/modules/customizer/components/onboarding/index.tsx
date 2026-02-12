"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Upload, Type, Palette, Shield, ShoppingCart, Smartphone, X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react"

const STORAGE_KEY = "letscase_customizer_onboarded"

interface Step {
  title: string
  description: string
  icon: React.ReactNode
  tip?: string
}

const STEPS: Step[] = [
  {
    title: "Welcome to the Case Designer!",
    description: "Create your own unique phone case in just a few simple steps. Let us walk you through the tools available.",
    icon: <Sparkles className="w-8 h-8" />,
    tip: "You can replay this tutorial anytime from the help menu.",
  },
  {
    title: "Upload Your Images",
    description: "Tap the Upload tool to add your own photos, artwork, or logos to the case. You can resize, rotate, and position them freely on the canvas.",
    icon: <Upload className="w-8 h-8" />,
    tip: "For best quality, use high-resolution images (at least 1000×1000 pixels).",
  },
  {
    title: "Add Custom Text",
    description: "Use the Text tool to add names, quotes, or any text you like. Choose from different fonts, sizes, and colors to match your style.",
    icon: <Type className="w-8 h-8" />,
    tip: "Tap any text on the canvas to edit it after placing.",
  },
  {
    title: "Pick a Background Color",
    description: "Choose a background color for your case using the Color tool. Pick from presets or enter a custom hex code.",
    icon: <Palette className="w-8 h-8" />,
    tip: "Lighter backgrounds make images and text pop more.",
  },
  {
    title: "Choose Your Case Type",
    description: "Select the protection level you need — Slim for a sleek look, Tough for maximum protection, Clear for a see-through effect, or MagSafe for wireless charging support.",
    icon: <Shield className="w-8 h-8" />,
    tip: "Each case type has different pricing based on materials used.",
  },
  {
    title: "Preview Your Design",
    description: "Use the Preview tool to see how your finished case will look. You can also download the design image from here.",
    icon: <Smartphone className="w-8 h-8" />,
  },
  {
    title: "Add to Cart",
    description: "When you're happy with your design, use the floating cart button at the bottom-right to add your custom case to your shopping cart.",
    icon: <ShoppingCart className="w-8 h-8" />,
    tip: "Your design is saved with your order so we can print it exactly as you created it.",
  },
]

export default function CustomizerOnboarding() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY)
      if (!seen) {
        // Small delay so the page renders first
        const timer = setTimeout(() => setShow(true), 800)
        return () => clearTimeout(timer)
      }
    } catch {}
  }, [])

  const dismiss = useCallback(() => {
    setShow(false)
    try { localStorage.setItem(STORAGE_KEY, "true") } catch {}
  }, [])

  const next = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      dismiss()
    }
  }, [step, dismiss])

  const prev = useCallback(() => {
    setStep((s) => Math.max(0, s - 1))
  }, [])

  if (!show) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const isFirst = step === 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-[380px] w-[90vw] mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Skip / Close */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 z-10 transition-colors"
          aria-label="Skip tutorial"
        >
          <X size={18} />
        </button>

        {/* Icon header */}
        <div className="bg-gradient-to-br from-brand to-brand-dark px-6 pt-8 pb-6 flex flex-col items-center text-white">
          <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mb-4">
            {current.icon}
          </div>
          <h3 className="text-lg font-bold text-center leading-tight">{current.title}</h3>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 leading-relaxed">{current.description}</p>

          {current.tip && (
            <div className="mt-3 flex items-start gap-2 bg-amber-50 rounded-xl px-3 py-2.5">
              <Sparkles size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">{current.tip}</p>
            </div>
          )}
        </div>

        {/* Progress + Navigation */}
        <div className="px-6 pb-5 flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-brand" : "w-2 bg-gray-200 hover:bg-gray-300"
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={prev}
                className="h-9 w-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <button
              onClick={next}
              className="h-9 px-4 flex items-center justify-center gap-1 rounded-full bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors"
            >
              {isLast ? "Get Started" : "Next"}
              {!isLast && <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
