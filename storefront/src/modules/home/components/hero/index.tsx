"use client"

import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useEffect, useState } from "react"

const TypewriterText = ({ texts, className }: { texts: string[], className?: string }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const text = texts[currentTextIndex]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < text.length) {
          setCurrentText(text.slice(0, currentText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(text.slice(0, currentText.length - 1))
        } else {
          setIsDeleting(false)
          setCurrentTextIndex((prev) => (prev + 1) % texts.length)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentTextIndex, texts])

  return (
    <span className={className}>
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

const Hero = () => {
  const typewriterTexts = [
    "Phone Cases",
    "Wireless Earbuds",
    "Fast Chargers",
    "Screen Protectors",
    "Power Banks",
  ]

  return (
    <div className="relative h-[90vh] w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      />

      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

      {/* Animated gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-t from-letscase-900/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="content-container">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-letscase-500/20 backdrop-blur-sm border border-letscase-400/30 text-white text-sm font-medium mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-letscase-400 rounded-full mr-2 animate-pulse"></span>
              Ghana&apos;s Premier Tech Store
            </div>

            {/* Main heading with typewriter */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Premium
              <br />
              <TypewriterText
                texts={typewriterTexts}
                className="text-letscase-400"
              />
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-lg leading-relaxed">
              Discover high-quality tech accessories designed for the modern lifestyle.
              Fast delivery across Ghana.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <LocalizedClientLink href="/store">
                <Button
                  size="large"
                  className="w-full sm:w-auto bg-letscase-500 hover:bg-letscase-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-letscase-500/30 hover:-translate-y-1"
                >
                  Shop Now
                </Button>
              </LocalizedClientLink>
              <LocalizedClientLink href="/categories">
                <Button
                  variant="secondary"
                  size="large"
                  className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300"
                >
                  Browse Categories
                </Button>
              </LocalizedClientLink>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 mt-12 text-gray-300 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-letscase-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free Delivery in Accra</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-letscase-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Mobile Money Accepted</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-letscase-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  )
}

export default Hero
