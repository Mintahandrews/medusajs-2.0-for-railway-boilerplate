"use client"

import { useEffect, useRef } from "react"
import introJs from "intro.js"
import { Tour } from "intro.js/src/packages/tour/tour"
import type { TooltipPosition } from "intro.js/src/packages/tooltip"
import "intro.js/introjs.css"

const STORAGE_KEY = "letscase_customizer_onboarded"

/**
 * Intro.js-powered onboarding tour for the Letscase phone-case customizer.
 *
 * Desktop: highlights the actual sidebar tools, canvas, actions, and cart FAB.
 * Mobile:  highlights the quick-bar icons, canvas, and bottom cart bar.
 *
 * Uses localStorage to avoid nagging returning users.
 */
export default function CustomizerOnboarding() {
  const instanceRef = useRef<Tour | null>(null)

  useEffect(() => {
    // Skip if already seen
    try {
      if (localStorage.getItem(STORAGE_KEY)) return
    } catch {
      return
    }

    // Small delay so the page and canvas fully render
    const timer = setTimeout(() => {
      startTour()
    }, 1000)

    return () => {
      clearTimeout(timer)
      // Clean up any running tour on unmount
      instanceRef.current?.exit(true)
    }
  }, [])

  function startTour() {
    const isMobile = window.innerWidth < 1024 // matches lg: breakpoint

    const steps = isMobile ? getMobileSteps() : getDesktopSteps()

    const intro = introJs()
    instanceRef.current = intro

    intro.setOptions({
      steps,
      showProgress: true,
      showBullets: false,
      exitOnOverlayClick: false,
      disableInteraction: true,
      scrollToElement: true,
      scrollPadding: 40,
      nextLabel: "Next →",
      prevLabel: "← Back",
      doneLabel: "Start Designing!",
      skipLabel: "Skip",
      hidePrev: true,
      overlayOpacity: 0.6,
      tooltipClass: "letscase-tour-tooltip",
      highlightClass: "letscase-tour-highlight",
      helperElementPadding: 8,
    })

    intro.oncomplete(() => markSeen())
    intro.onexit(() => markSeen())

    intro.start()
  }

  function markSeen() {
    try {
      localStorage.setItem(STORAGE_KEY, "true")
    } catch {}
  }

  return (
    <>
      {/* Intro.js brand theme overrides */}
      <style dangerouslySetInnerHTML={{ __html: TOUR_STYLES }} />
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*  Step definitions                                                           */
/* -------------------------------------------------------------------------- */

type StepDef = {
  element?: string
  intro: string
  position?: TooltipPosition
}

function getDesktopSteps(): StepDef[] {
  return [
    // 1. Welcome — floating (no element)
    {
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">🎨</div>
          <h3>Welcome to the Case Designer!</h3>
          <p>Create a one-of-a-kind phone case in just a few steps. Let us show you around.</p>
        </div>`,
    },
    // 2. Canvas
    {
      element: "[data-tour='canvas-area']",
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">📱</div>
          <h3>Your Design Canvas</h3>
          <p>This is where your case comes to life. Drag, resize, and rotate images and text directly on the canvas.</p>
          <div class="lc-tip">💡 Scroll to zoom in and out on the canvas.</div>
        </div>`,
      position: "left",
    },
    // 3. Toolbar tabs
    {
      element: "[data-tour='toolbar-tabs']",
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">🛠️</div>
          <h3>Your Design Tools</h3>
          <p>All your creative tools live here. Switch between them to build your design layer by layer.</p>
        </div>`,
      position: "right",
    },
    // 4. Upload tool
    {
      element: "[data-tour='tool-upload']",
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">📤</div>
          <h3>Upload Images</h3>
          <p>Add your own photos, artwork, or logos. Drag them on the canvas to position perfectly.</p>
          <div class="lc-tip">💡 Use high-res images (1000×1000px+) for the sharpest print.</div>
        </div>`,
      position: "right",
    },
    // 5. Text tool
    {
      element: "[data-tour='tool-text']",
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">✏️</div>
          <h3>Add Text</h3>
          <p>Type names, quotes, or anything you like. Choose fonts, sizes, and colors to match your style.</p>
          <div class="lc-tip">💡 Tap any text on the canvas to edit it afterwards.</div>
        </div>`,
      position: "right",
    },
    // 6. Background color
    {
      element: "[data-tour='tool-background']",
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">🎨</div>
          <h3>Background Color</h3>
          <p>Set a background color for your case. Pick a preset or enter a custom hex code.</p>
          <div class="lc-tip">💡 Lighter backgrounds make images &amp; text pop!</div>
        </div>`,
      position: "right",
    },
    // 7. Case type
    {
      element: "[data-tour='tool-case-type']",
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">🛡️</div>
          <h3>Choose Your Case</h3>
          <p>Select protection level — Slim, Tough, Clear, or MagSafe. Each has different pricing based on materials.</p>
        </div>`,
      position: "right",
    },
    // 8. Preview
    {
      element: "[data-tour='tool-preview']",
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">👁️</div>
          <h3>Preview Design</h3>
          <p>See a realistic preview of your finished case before ordering.</p>
        </div>`,
      position: "right",
    },
    // 9. Actions bar
    {
      element: "[data-tour='actions-bar']",
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">⚡</div>
          <h3>Quick Actions</h3>
          <p>Undo, Redo, and Delete give you full control. Made a mistake? Just undo it!</p>
        </div>`,
      position: "top",
    },
    // 10. Download button
    {
      element: "[data-tour='download-btn']",
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">⬇️</div>
          <h3>Download Preview</h3>
          <p>Save a copy of your design as an image. Great for sharing or keeping a record!</p>
        </div>`,
      position: "top",
    },
    // 11. Floating cart
    {
      element: "[data-tour='floating-cart']",
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">🛒</div>
          <h3>Add to Cart</h3>
          <p>When you're happy with your creation, hit the cart button to add your custom case to your order.</p>
          <div class="lc-tip">💡 Your design is saved with the order so we print it exactly as you created it.</div>
        </div>`,
      position: "left",
    },
    // 12. Ready!
    {
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">🚀</div>
          <h3>You're All Set!</h3>
          <p>Start designing your dream case. Have fun and let your creativity flow!</p>
        </div>`,
    },
  ]
}

function getMobileSteps(): StepDef[] {
  return [
    // 1. Welcome
    {
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">🎨</div>
          <h3>Welcome to the Case Designer!</h3>
          <p>Create your own unique phone case. Swipe through this quick guide to learn how.</p>
        </div>`,
    },
    // 2. Canvas
    {
      element: "[data-tour='canvas-area']",
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">📱</div>
          <h3>Your Design Canvas</h3>
          <p>Drag, resize, and rotate objects here. Pinch to zoom in and out.</p>
        </div>`,
      position: "bottom",
    },
    // 3. Mobile quick bar
    {
      element: "[data-tour='mobile-quick-bar']",
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">🛠️</div>
          <h3>Tool Quick Bar</h3>
          <p>Tap any icon to open that tool. Upload images, add text, change colors, pick a case style, or preview your design.</p>
          <div class="lc-tip">💡 Swipe up on the bottom sheet for additional options.</div>
        </div>`,
      position: "top",
    },
    // 4. Add to cart (mobile bar)
    {
      element: "[data-tour='floating-cart-mobile']",
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">🛒</div>
          <h3>Add to Cart</h3>
          <p>When your design is ready, tap here to add it to your shopping cart and checkout.</p>
          <div class="lc-tip">💡 Your design is saved with your order for exact printing.</div>
        </div>`,
      position: "top",
    },
    // 5. Ready!
    {
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">🚀</div>
          <h3>You're All Set!</h3>
          <p>Start designing your dream case. Tap any tool to get started!</p>
        </div>`,
    },
  ]
}

/* -------------------------------------------------------------------------- */
/*  Custom CSS — brand-themed Intro.js overrides                               */
/* -------------------------------------------------------------------------- */

const TOUR_STYLES = `
/* ── Tooltip container ── */
.introjs-tooltip.letscase-tour-tooltip {
  max-width: 360px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(93,171,166,0.15);
  padding: 0;
  overflow: hidden;
  font-family: inherit;
}

/* ── Inner step markup ── */
.lc-step {
  padding: 20px 22px 16px;
}
.lc-step-icon {
  font-size: 28px;
  margin-bottom: 8px;
}
.lc-step h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 6px;
  line-height: 1.3;
}
.lc-step p {
  font-size: 13px;
  color: #555;
  line-height: 1.6;
  margin: 0;
}
.lc-tip {
  margin-top: 10px;
  padding: 8px 12px;
  background: #fffbeb;
  border-radius: 10px;
  font-size: 12px;
  color: #92400e;
  line-height: 1.5;
}

/* ── Tooltip header (progress bar area) ── */
.letscase-tour-tooltip .introjs-tooltiptext {
  padding: 0;
}

/* ── Progress bar ── */
.letscase-tour-tooltip .introjs-progress {
  margin: 0 22px;
  background: #e5e7eb;
  border-radius: 2px;
  height: 4px;
  overflow: hidden;
}
.letscase-tour-tooltip .introjs-progressbar {
  background: #5DABA6;
  height: 4px;
  border-radius: 2px;
}

/* ── Button row ── */
.letscase-tour-tooltip .introjs-tooltipbuttons {
  border-top: 1px solid #f0f0f0;
  padding: 12px 22px;
  display: flex;
  gap: 8px;
  align-items: center;
}

/* ── All buttons ── */
.letscase-tour-tooltip .introjs-button {
  border: none;
  font-size: 13px;
  font-weight: 600;
  border-radius: 10px;
  padding: 8px 18px;
  text-shadow: none;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

/* ── Skip / close button ── */
.letscase-tour-tooltip .introjs-skipbutton {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
  margin-right: auto;
  padding: 8px 4px;
}
.letscase-tour-tooltip .introjs-skipbutton:hover {
  color: #6b7280;
}

/* ── Previous button ── */
.letscase-tour-tooltip .introjs-prevbutton {
  background: #f3f4f6;
  color: #374151;
}
.letscase-tour-tooltip .introjs-prevbutton:hover {
  background: #e5e7eb;
}

/* ── Next / Done button ── */
.letscase-tour-tooltip .introjs-nextbutton,
.letscase-tour-tooltip .introjs-donebutton {
  background: #5DABA6;
  color: #fff;
}
.letscase-tour-tooltip .introjs-nextbutton:hover,
.letscase-tour-tooltip .introjs-donebutton:hover {
  background: #3D8B87;
}
.letscase-tour-tooltip .introjs-nextbutton:focus,
.letscase-tour-tooltip .introjs-donebutton:focus {
  background: #3D8B87;
  box-shadow: 0 0 0 3px rgba(93,171,166,0.3);
}

/* ── Disabled button ── */
.letscase-tour-tooltip .introjs-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── Highlight ring ── */
.letscase-tour-highlight {
  box-shadow: 0 0 0 4px rgba(93,171,166,0.3) !important;
  border-radius: 12px;
}

/* ── Arrow / helper layer ── */
.introjs-helperLayer {
  border-radius: 12px;
}

/* ── Overlay ── */
.introjs-overlay {
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(2px);
}

/* ── Mobile adjustments ── */
@media (max-width: 1023px) {
  .introjs-tooltip.letscase-tour-tooltip {
    max-width: calc(100vw - 32px);
    margin: 0 16px;
  }
  .lc-step {
    padding: 16px 18px 12px;
  }
  .lc-step h3 {
    font-size: 15px;
  }
  .lc-step p {
    font-size: 12px;
  }
  .letscase-tour-tooltip .introjs-tooltipbuttons {
    padding: 10px 18px;
  }
}
`
