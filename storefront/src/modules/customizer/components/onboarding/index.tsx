"use client"

import { useCallback, useEffect, useRef } from "react"
import introJs from "intro.js"
import { Tour } from "intro.js/src/packages/tour/tour"
import type { TooltipPosition } from "intro.js/src/packages/tooltip"
import "intro.js/introjs.css"

const STORAGE_KEY = "letscase_customizer_onboarded"

/* -------------------------------------------------------------------------- */
/*  Inline SVG icons (Lucide) — used in Intro.js HTML template strings        */
/* -------------------------------------------------------------------------- */

const SVG_ATTRS = 'xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
const SVG_TIP = 'xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:text-bottom;margin-right:4px"'

const ICON = {
  palette: `<svg ${SVG_ATTRS}><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/></svg>`,
  smartphone: `<svg ${SVG_ATTRS}><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>`,
  hammer: `<svg ${SVG_ATTRS}><path d="m15 12-9.373 9.373a1 1 0 0 1-3.001-3L12 9"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/></svg>`,
  cloudUpload: `<svg ${SVG_ATTRS}><path d="M12 13v8"/><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m8 17 4-4 4 4"/></svg>`,
  pencil: `<svg ${SVG_ATTRS}><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>`,
  shield: `<svg ${SVG_ATTRS}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`,
  eye: `<svg ${SVG_ATTRS}><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`,
  zap: `<svg ${SVG_ATTRS}><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>`,
  download: `<svg ${SVG_ATTRS}><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>`,
  shoppingCart: `<svg ${SVG_ATTRS}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
  rocket: `<svg ${SVG_ATTRS}><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"/><path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"/></svg>`,
  lightbulb: `<svg ${SVG_TIP}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
} as const

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

  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "true")
    } catch {}
  }, [])

  const startTour = useCallback(() => {
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
  }, [markSeen])

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
  }, [startTour])

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
          <div class="lc-step-icon">${ICON.palette}</div>
          <h3>Welcome to the Case Designer!</h3>
          <p>Create a one-of-a-kind phone case in just a few steps. Let us show you around.</p>
        </div>`,
    },
    // 2. Canvas
    {
      element: "[data-tour='canvas-area']",
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">${ICON.smartphone}</div>
          <h3>Your Design Canvas</h3>
          <p>This is where your case comes to life. Drag, resize, and rotate images and text directly on the canvas.</p>
          <div class="lc-tip">${ICON.lightbulb} Scroll to zoom in and out on the canvas.</div>
        </div>`,
      position: "left",
    },
    // 3. Toolbar tabs
    {
      element: "[data-tour='toolbar-tabs']",
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">${ICON.hammer}</div>
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
          <div class="lc-step-icon">${ICON.cloudUpload}</div>
          <h3>Upload Images</h3>
          <p>Add your own photos, artwork, or logos. Drag them on the canvas to position perfectly.</p>
          <div class="lc-tip">${ICON.lightbulb} Use high-res images (1000×1000px+) for the sharpest print.</div>
        </div>`,
      position: "right",
    },
    // 5. Text tool
    {
      element: "[data-tour='tool-text']",
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">${ICON.pencil}</div>
          <h3>Add Text</h3>
          <p>Type names, quotes, or anything you like. Choose fonts, sizes, and colors to match your style.</p>
          <div class="lc-tip">${ICON.lightbulb} Tap any text on the canvas to edit it afterwards.</div>
        </div>`,
      position: "right",
    },
    // 6. Background color
    {
      element: "[data-tour='tool-background']",
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">${ICON.palette}</div>
          <h3>Background Color</h3>
          <p>Set a background color for your case. Pick a preset or enter a custom hex code.</p>
          <div class="lc-tip">${ICON.lightbulb} Lighter backgrounds make images &amp; text pop!</div>
        </div>`,
      position: "right",
    },
    // 7. Case type
    {
      element: "[data-tour='tool-case-type']",
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">${ICON.shield}</div>
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
          <div class="lc-step-icon">${ICON.eye}</div>
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
          <div class="lc-step-icon">${ICON.zap}</div>
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
          <div class="lc-step-icon">${ICON.download}</div>
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
          <div class="lc-step-icon">${ICON.shoppingCart}</div>
          <h3>Add to Cart</h3>
          <p>When you're happy with your creation, hit the cart button to add your custom case to your order.</p>
          <div class="lc-tip">${ICON.lightbulb} Your design is saved with the order so we print it exactly as you created it.</div>
        </div>`,
      position: "left",
    },
    // 12. Ready!
    {
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">${ICON.rocket}</div>
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
          <div class="lc-step-icon">${ICON.palette}</div>
          <h3>Welcome to the Case Designer!</h3>
          <p>Create your own unique phone case. Swipe through this quick guide to learn how.</p>
        </div>`,
    },
    // 2. Canvas
    {
      element: "[data-tour='canvas-area']",
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">${ICON.smartphone}</div>
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
          <div class="lc-step-icon">${ICON.hammer}</div>
          <h3>Tool Quick Bar</h3>
          <p>Tap any icon to open that tool. Upload images, add text, change colors, pick a case style, or preview your design.</p>
          <div class="lc-tip">${ICON.lightbulb} Swipe up on the bottom sheet for additional options.</div>
        </div>`,
      position: "top",
    },
    // 4. Add to cart (mobile bar)
    {
      element: "[data-tour='floating-cart-mobile']",
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">${ICON.shoppingCart}</div>
          <h3>Add to Cart</h3>
          <p>When your design is ready, tap here to add it to your shopping cart and checkout.</p>
          <div class="lc-tip">${ICON.lightbulb} Your design is saved with your order for exact printing.</div>
        </div>`,
      position: "top",
    },
    // 5. Ready!
    {
      intro: `
        <div class="lc-step">
          <div class="lc-step-icon">${ICON.rocket}</div>
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
  margin-bottom: 8px;
  color: #5DABA6;
  line-height: 1;
}
.lc-step-icon svg {
  display: inline-block;
  vertical-align: middle;
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
