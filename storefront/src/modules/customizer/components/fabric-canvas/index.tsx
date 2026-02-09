"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import { useCustomizer, type CaseType } from "../../context"
import type { DeviceConfig } from "@lib/device-assets"

/* -------------------------------------------------------------------------- */
/*  Camera module overlay — accurate dimensions from device specs              */
/*                                                                             */
/*  Sources: Apple specs, Samsung specs, Google specs, GSMArena, iFixit        */
/*  All positions expressed as ratios of canvasWidth (cw) so they scale.       */
/*  canvasHeight (ch) used where vertical positioning needs the full ratio.    */
/* -------------------------------------------------------------------------- */

/**
 * Camera family classification.
 *
 * - iphone-16-vertical : iPhone 16 / 16 Plus  — vertical pill, 2 lenses
 * - iphone-diagonal    : iPhone 11–15 standard — diagonal dual in square
 */
function getCameraFamily(handle: string): string {
  // iPhone 16 / 16 Plus — vertical pill (new for 2024)
  if (/^iphone-16(-plus)?$/.test(handle)) return "iphone-16-vertical"
  // iPhone 16 Pro / Pro Max — larger triple module (~39mm)
  if (/^iphone-16-pro/.test(handle)) return "iphone-16-pro-triple"
  // iPhone 11 Pro / Pro Max — triple in ~36mm module
  if (/^iphone-11-pro/.test(handle)) return "iphone-11-triple"
  // iPhone 11 standard — smaller dual in ~25mm module
  if (/^iphone-11$/.test(handle)) return "iphone-11-dual"
  // iPhone 12–15 Pro — triple in ~36mm module
  if (/iphone-\d+-pro/.test(handle)) return "iphone-triple"
  // iPhone 12–15 standard / mini / Plus — diagonal dual in ~28mm module
  if (/^iphone-/.test(handle)) return "iphone-diagonal"
  // Samsung Ultra — 4 individual circles
  if (/samsung.*ultra/.test(handle)) return "samsung-quad"
  // Samsung standard — 3 individual circles
  if (/samsung/.test(handle)) return "samsung-triple"
  // Pixel 8 / 8 Pro — edge-to-edge camera visor bar
  if (/^pixel-8/.test(handle)) return "pixel-8-bar"
  // Pixel 9 / 9 Pro / 9 Pro XL — floating pill camera island
  if (/^pixel-9/.test(handle)) return "pixel-9-pill"
  return "iphone-diagonal"
}

/** Render a single CSS lens circle */
function Lens({
  cx, cy, d, s, type = "lens",
}: {
  cx: number; cy: number; d: number; s: number
  type?: "lens" | "flash" | "sensor"
}) {
  const base = {
    position: "absolute" as const,
    left: (cx - d / 2) * s,
    top: (cy - d / 2) * s,
    width: d * s,
    height: d * s,
    borderRadius: "50%",
  }
  if (type === "flash") {
    return <div style={{ ...base, background: "radial-gradient(circle, #ffeebb 30%, #997744 100%)" }} />
  }
  if (type === "sensor") {
    return <div style={{ ...base, background: "#1a1a1a", boxShadow: `inset 0 0 ${1.5 * s}px rgba(60,60,60,0.6)` }} />
  }
  return (
    <div
      style={{
        ...base,
        background: "radial-gradient(circle, #1a1a3a 40%, #0d0d1a 70%, #333 100%)",
        boxShadow: `inset 0 0 ${3 * s}px rgba(100,100,255,0.15), 0 0 0 ${1.5 * s}px rgba(80,80,80,0.6)`,
      }}
    />
  )
}

/**
 * Camera module overlay — positioned absolutely over the canvas container.
 * All values are in canvas-pixels (pre-scale); multiplied by `s` for display.
 */
function CameraOverlay({ config, scale }: { config: DeviceConfig; scale: number }) {
  const family = getCameraFamily(config.handle)
  const cw = config.canvasWidth
  const ch = config.canvasHeight
  const s = scale

  /* ================================================================== */
  /*  1. iPhone 16 / 16 Plus — vertical pill, 2 stacked lenses          */
  /*  Real: pill ~14mm W × 28mm H on 71.6mm body                       */
  /* ================================================================== */
  if (family === "iphone-16-vertical") {
    const pillW = Math.round(cw * 0.196)
    const pillH = Math.round(ch * 0.190)
    const pillX = Math.round(cw * 0.112)
    const pillY = Math.round(ch * 0.034)
    const pillR = Math.round(pillW / 2)
    const ld = Math.round(pillW * 0.78)
    const flashD = Math.round(pillW * 0.18)
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: pillY * s, left: pillX * s,
          width: pillW * s, height: pillH * s,
          borderRadius: pillR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: `inset 0 0 0 ${1.5 * s}px rgba(60,60,60,0.5), 0 0 ${4 * s}px rgba(0,0,0,0.3)`,
        }}
      >
        <Lens cx={pillW * 0.50} cy={pillH * 0.32} d={ld} s={s} />
        <Lens cx={pillW * 0.50} cy={pillH * 0.68} d={ld} s={s} />
        <Lens cx={pillW * 0.82} cy={pillH * 0.12} d={flashD} s={s} type="flash" />
      </div>
    )
  }

  /* ================================================================== */
  /*  2. iPhone 16 Pro / Pro Max — larger triple module (~39mm)          */
  /*  Real: module ~39mm on 71.5mm body → 54.5% of width                */
  /* ================================================================== */
  if (family === "iphone-16-pro-triple") {
    const mod = Math.round(cw * 0.545)
    const modX = Math.round(cw * 0.044)
    const modY = Math.round(ch * 0.021)
    const modR = Math.round(mod * 0.26)
    const ld = Math.round(mod * 0.34)
    const flashD = Math.round(mod * 0.09)
    const sensorD = Math.round(mod * 0.06)
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: modY * s, left: modX * s,
          width: mod * s, height: mod * s,
          borderRadius: modR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: `inset 0 0 0 ${1.5 * s}px rgba(60,60,60,0.5), 0 0 ${4 * s}px rgba(0,0,0,0.3)`,
        }}
      >
        <Lens cx={mod * 0.30} cy={mod * 0.30} d={ld} s={s} />
        <Lens cx={mod * 0.70} cy={mod * 0.30} d={ld} s={s} />
        <Lens cx={mod * 0.50} cy={mod * 0.70} d={ld} s={s} />
        <Lens cx={mod * 0.72} cy={mod * 0.70} d={flashD} s={s} type="flash" />
        <Lens cx={mod * 0.28} cy={mod * 0.70} d={sensorD} s={s} type="sensor" />
      </div>
    )
  }

  /* ================================================================== */
  /*  3. iPhone 11 Pro / Pro Max — triple in ~36mm module                */
  /*  Real: module ~36mm on 71.4mm body → 50.4% of width                */
  /* ================================================================== */
  if (family === "iphone-11-triple") {
    const mod = Math.round(cw * 0.504)
    const modX = Math.round(cw * 0.050)
    const modY = Math.round(ch * 0.025)
    const modR = Math.round(mod * 0.27)
    const ld = Math.round(mod * 0.36)
    const flashD = Math.round(mod * 0.09)
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: modY * s, left: modX * s,
          width: mod * s, height: mod * s,
          borderRadius: modR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: `inset 0 0 0 ${1.5 * s}px rgba(60,60,60,0.5), 0 0 ${4 * s}px rgba(0,0,0,0.3)`,
        }}
      >
        <Lens cx={mod * 0.30} cy={mod * 0.30} d={ld} s={s} />
        <Lens cx={mod * 0.70} cy={mod * 0.30} d={ld} s={s} />
        <Lens cx={mod * 0.50} cy={mod * 0.70} d={ld} s={s} />
        <Lens cx={mod * 0.72} cy={mod * 0.70} d={flashD} s={s} type="flash" />
      </div>
    )
  }

  /* ================================================================== */
  /*  4. iPhone 11 standard — smaller dual in ~25mm module               */
  /*  Real: module ~25mm on 75.7mm body → 33% of width                  */
  /* ================================================================== */
  if (family === "iphone-11-dual") {
    const mod = Math.round(cw * 0.330)
    const modX = Math.round(cw * 0.055)
    const modY = Math.round(ch * 0.028)
    const modR = Math.round(mod * 0.28)
    const ld = Math.round(mod * 0.40)
    const flashD = Math.round(mod * 0.12)
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: modY * s, left: modX * s,
          width: mod * s, height: mod * s,
          borderRadius: modR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: `inset 0 0 0 ${1.5 * s}px rgba(60,60,60,0.5), 0 0 ${4 * s}px rgba(0,0,0,0.3)`,
        }}
      >
        <Lens cx={mod * 0.33} cy={mod * 0.33} d={ld} s={s} />
        <Lens cx={mod * 0.67} cy={mod * 0.67} d={ld} s={s} />
        <Lens cx={mod * 0.67} cy={mod * 0.33} d={flashD} s={s} type="flash" />
      </div>
    )
  }

  /* ================================================================== */
  /*  5. iPhone 12–15 Pro — triple in ~36mm module                      */
  /*  Real: module ~36mm on 71.5mm body → 50.3% of width                */
  /* ================================================================== */
  if (family === "iphone-triple") {
    const mod = Math.round(cw * 0.503)
    const modX = Math.round(cw * 0.049)
    const modY = Math.round(ch * 0.023)
    const modR = Math.round(mod * 0.27)
    const ld = Math.round(mod * 0.35)
    const flashD = Math.round(mod * 0.09)
    const sensorD = Math.round(mod * 0.06)
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: modY * s, left: modX * s,
          width: mod * s, height: mod * s,
          borderRadius: modR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: `inset 0 0 0 ${1.5 * s}px rgba(60,60,60,0.5), 0 0 ${4 * s}px rgba(0,0,0,0.3)`,
        }}
      >
        <Lens cx={mod * 0.30} cy={mod * 0.30} d={ld} s={s} />
        <Lens cx={mod * 0.70} cy={mod * 0.30} d={ld} s={s} />
        <Lens cx={mod * 0.50} cy={mod * 0.70} d={ld} s={s} />
        <Lens cx={mod * 0.72} cy={mod * 0.70} d={flashD} s={s} type="flash" />
        <Lens cx={mod * 0.28} cy={mod * 0.70} d={sensorD} s={s} type="sensor" />
      </div>
    )
  }

  /* ================================================================== */
  /*  6. iPhone 12–15 standard / mini / Plus — diagonal dual ~28mm      */
  /*  Real: module ~28mm on 71.5mm body → 39.2% of width                */
  /* ================================================================== */
  if (family === "iphone-diagonal") {
    const mod = Math.round(cw * 0.392)
    const modX = Math.round(cw * 0.049)
    const modY = Math.round(ch * 0.024)
    const modR = Math.round(mod * 0.28)
    const ld = Math.round(mod * 0.38)
    const flashD = Math.round(mod * 0.10)
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: modY * s, left: modX * s,
          width: mod * s, height: mod * s,
          borderRadius: modR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: `inset 0 0 0 ${1.5 * s}px rgba(60,60,60,0.5), 0 0 ${4 * s}px rgba(0,0,0,0.3)`,
        }}
      >
        <Lens cx={mod * 0.33} cy={mod * 0.33} d={ld} s={s} />
        <Lens cx={mod * 0.67} cy={mod * 0.67} d={ld} s={s} />
        <Lens cx={mod * 0.67} cy={mod * 0.33} d={flashD} s={s} type="flash" />
      </div>
    )
  }

  /* ================================================================== */
  /*  7. Samsung Galaxy S23/S24/S25 — 3 individual raised circles       */
  /*  Real: lens ~13mm on ~70.6mm body, cx ~17%, gap ~9.5% of height    */
  /* ================================================================== */
  if (family === "samsung-triple") {
    const ld = Math.round(cw * 0.184)
    const cx = Math.round(cw * 0.170)
    const startY = Math.round(ch * 0.095)
    const gap = Math.round(ch * 0.095)
    const flashD = Math.round(cw * 0.04)
    return (
      <div className="absolute pointer-events-none z-10 inset-0">
        <Lens cx={cx} cy={startY} d={ld} s={s} />
        <Lens cx={cx} cy={startY + gap} d={ld} s={s} />
        <Lens cx={cx} cy={startY + gap * 2} d={ld} s={s} />
        <Lens cx={cx} cy={startY + gap * 2 + gap * 0.65} d={flashD} s={s} type="flash" />
      </div>
    )
  }

  /* ================================================================== */
  /*  8. Samsung Galaxy S Ultra — 4 individual circles, graduated sizes */
  /*  Real: lenses decrease top→bottom: 200MP wide > ultrawide > 3x    */
  /*  tele > 5x periscope. cx ~15.2%, varied gaps                       */
  /* ================================================================== */
  if (family === "samsung-quad") {
    const cx = Math.round(cw * 0.152)
    const startY = Math.round(ch * 0.075)
    const gap = Math.round(ch * 0.082)
    const d1 = Math.round(cw * 0.185)  // wide — largest
    const d2 = Math.round(cw * 0.170)  // ultrawide
    const d3 = Math.round(cw * 0.150)  // 3x telephoto
    const d4 = Math.round(cw * 0.135)  // 5x periscope — smallest
    const flashD = Math.round(cw * 0.04)
    return (
      <div className="absolute pointer-events-none z-10 inset-0">
        <Lens cx={cx} cy={startY} d={d1} s={s} />
        <Lens cx={cx} cy={startY + gap} d={d2} s={s} />
        <Lens cx={cx} cy={startY + gap * 2.05} d={d3} s={s} />
        <Lens cx={cx} cy={startY + gap * 3.15} d={d4} s={s} />
        <Lens cx={cx} cy={startY + gap * 3.15 + gap * 0.7} d={flashD} s={s} type="flash" />
      </div>
    )
  }

  /* ================================================================== */
  /*  9. Google Pixel 8 / 8 Pro — edge-to-edge camera visor bar         */
  /*  Real: visor ~18-20mm tall, spans full width flush with edges       */
  /* ================================================================== */
  if (family === "pixel-8-bar") {
    const barW = Math.round(cw * 0.92)
    const barH = Math.round(ch * 0.115)
    const barX = Math.round((cw - barW) / 2)
    const barY = Math.round(ch * 0.045)
    const barR = Math.round(barH * 0.15)
    const ld = Math.round(barH * 0.58)
    const flashD = Math.round(barH * 0.25)
    const isPro = config.handle.includes("pro")
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: barY * s, left: barX * s,
          width: barW * s, height: barH * s,
          borderRadius: barR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: `inset 0 0 0 ${1.5 * s}px rgba(60,60,60,0.4), 0 0 ${4 * s}px rgba(0,0,0,0.3)`,
        }}
      >
        <Lens cx={barW * 0.18} cy={barH * 0.50} d={ld} s={s} />
        <Lens cx={barW * 0.36} cy={barH * 0.50} d={ld} s={s} />
        {isPro && <Lens cx={barW * 0.54} cy={barH * 0.50} d={ld * 0.85} s={s} />}
        <Lens cx={barW * (isPro ? 0.72 : 0.56)} cy={barH * 0.50} d={flashD} s={s} type="flash" />
        {isPro && <Lens cx={barW * 0.82} cy={barH * 0.50} d={flashD * 0.6} s={s} type="sensor" />}
      </div>
    )
  }

  /* ================================================================== */
  /*  10. Google Pixel 9 / 9 Pro / 9 Pro XL — floating pill island      */
  /*  Real: pill ~18mm tall, doesn't touch edges, rounded pill ends      */
  /* ================================================================== */
  if (family === "pixel-9-pill") {
    const barW = Math.round(cw * 0.78)
    const barH = Math.round(ch * 0.105)
    const barX = Math.round((cw - barW) / 2)
    const barY = Math.round(ch * 0.050)
    const barR = Math.round(barH / 2)
    const ld = Math.round(barH * 0.60)
    const flashD = Math.round(barH * 0.25)
    const isPro = config.handle.includes("pro")
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: barY * s, left: barX * s,
          width: barW * s, height: barH * s,
          borderRadius: barR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: `inset 0 0 0 ${1.5 * s}px rgba(60,60,60,0.4), 0 ${2 * s}px ${6 * s}px rgba(0,0,0,0.3)`,
        }}
      >
        <Lens cx={barW * 0.22} cy={barH * 0.50} d={ld} s={s} />
        <Lens cx={barW * 0.42} cy={barH * 0.50} d={ld} s={s} />
        {isPro && <Lens cx={barW * 0.62} cy={barH * 0.50} d={ld * 0.85} s={s} />}
        <Lens cx={barW * (isPro ? 0.80 : 0.65)} cy={barH * 0.50} d={flashD} s={s} type="flash" />
        {isPro && <Lens cx={barW * 0.90} cy={barH * 0.50} d={flashD * 0.6} s={s} type="sensor" />}
      </div>
    )
  }

  return null
}

/* -------------------------------------------------------------------------- */
/*  Case-type visual overlays                                                 */
/* -------------------------------------------------------------------------- */

/** Renders visual effects inside the canvas container based on case type */
function CaseTypeOverlay({
  caseType, w, h, r, s,
}: {
  caseType: CaseType; w: number; h: number; r: number; s: number
}) {
  if (caseType === "clear") {
    // Glass sheen diagonal highlight + subtle frosted edge
    return (
      <div className="absolute inset-0 pointer-events-none z-20" style={{ borderRadius: r }}>
        {/* Diagonal glass sheen */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: r,
            background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.08) 100%)",
          }}
        />
        {/* Frosted edge glow */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: r,
            boxShadow: `inset 0 0 ${12 * s}px rgba(255,255,255,0.15), inset 0 0 ${3 * s}px rgba(255,255,255,0.1)`,
          }}
        />
      </div>
    )
  }

  if (caseType === "magsafe") {
    // Centered magnet ring
    const ringSize = Math.min(w, h) * 0.42
    const ringThickness = Math.max(2, 3 * s)
    return (
      <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
        <div
          style={{
            width: ringSize,
            height: ringSize,
            borderRadius: "50%",
            border: `${ringThickness}px solid rgba(120,120,120,0.35)`,
            boxShadow: `0 0 ${6 * s}px rgba(100,100,100,0.15), inset 0 0 ${4 * s}px rgba(100,100,100,0.1)`,
          }}
        />
      </div>
    )
  }

  return null
}

/** Tough case corner bumper accents — positioned outside the frame */
function ToughCornerBumpers({
  w, h, r, s, frameWidth,
}: {
  w: number; h: number; r: number; s: number; frameWidth: number
}) {
  const bumpW = Math.max(8, 14 * s)
  const bumpH = Math.max(3, 4 * s)
  const offset = frameWidth + Math.max(1, 1.5 * s)
  const cornerOffset = r * 0.55

  // Each corner gets two small bumps (one horizontal, one vertical)
  const corners = [
    // top-left
    { x: cornerOffset, y: -offset, rotate: 0 },
    { x: -offset, y: cornerOffset, rotate: 90 },
    // top-right
    { x: w - cornerOffset - bumpW, y: -offset, rotate: 0 },
    { x: w + offset - bumpH, y: cornerOffset, rotate: 90 },
    // bottom-left
    { x: cornerOffset, y: h + offset - bumpH, rotate: 0 },
    { x: -offset, y: h - cornerOffset - bumpW, rotate: 90 },
    // bottom-right
    { x: w - cornerOffset - bumpW, y: h + offset - bumpH, rotate: 0 },
    { x: w + offset - bumpH, y: h - cornerOffset - bumpW, rotate: 90 },
  ]

  return (
    <>
      {corners.map((c, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: c.x,
            top: c.y,
            width: c.rotate === 90 ? bumpH : bumpW,
            height: c.rotate === 90 ? bumpW : bumpH,
            borderRadius: bumpH / 2,
            background: "#2a2a2a",
          }}
        />
      ))}
    </>
  )
}

/**
 * The core Fabric.js canvas component.
 */
export default function FabricCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const {
    state,
    canvasRef,
    deviceConfig,
    pushHistory,
    undo,
    redo,
    dispatch,
  } = useCustomizer()

  const [displayScale, setDisplayScale] = useState(1)

  /* ---- Keyboard shortcuts ---------------------------------------------- */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      // Don't intercept when user is typing in an input / IText
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return

      // Check if user is editing an IText on canvas
      const active = canvas.getActiveObject?.()
      if (active?.isEditing) return

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        const objects = canvas.getActiveObjects()
        if (objects?.length) {
          objects.forEach((obj: any) => canvas.remove(obj))
          canvas.discardActiveObject()
          canvas.renderAll()
          pushHistory()
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
      }

      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault()
        redo()
      }
    },
    [canvasRef, pushHistory, undo, redo]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  /* ---- Initialise Fabric.js -------------------------------------------- */
  useEffect(() => {
    let fabricCanvas: any = null
    let disposed = false

    async function init() {
      const fabric = await import("fabric")
      if (disposed || !canvasElRef.current) return

      const { canvasWidth, canvasHeight, editorMaskPath } = deviceConfig

      /* 1. Create the canvas ------------------------------------------------ */
      fabricCanvas = new fabric.Canvas(canvasElRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: "#ffffff",
        selection: true,
        preserveObjectStacking: true,
      })

      /* 2. Apply clipPath — the rounded-rect phone outline ------------------ */
      const clipPath = new fabric.Path(editorMaskPath, {
        originX: "left",
        originY: "top",
        left: 0,
        top: 0,
        absolutePositioned: true,
      })
      fabricCanvas.clipPath = clipPath

      /* 3. Touch / mobile support ------------------------------------------- */
      // Allow touch gestures on the canvas (pinch to scale/rotate objects)
      fabricCanvas.allowTouchScrolling = false // prevent canvas from scrolling page
      fabricCanvas.on("touch:gesture", (e: any) => {
        // Pinch-to-scale the active object
        if (e.e?.touches?.length === 2 && e.self?.scale) {
          const active = fabricCanvas.getActiveObject()
          if (active) {
            active.scaleX = (active.scaleX || 1) * e.self.scale
            active.scaleY = (active.scaleY || 1) * e.self.scale
            fabricCanvas.renderAll()
          }
        }
      })

      /* 5. Canvas events → history ----------------------------------------- */
      fabricCanvas.on("object:modified", () => pushHistory())

      /* 6. Expose to context & render -------------------------------------- */
      canvasRef.current = fabricCanvas
      fabricCanvas.renderAll()

      // push initial blank state
      pushHistory()
      dispatch({ type: "SET_CANVAS_READY", ready: true })
    }

    init()

    return () => {
      disposed = true
      if (fabricCanvas) {
        fabricCanvas.dispose()
        canvasRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceConfig.handle])

  /* ---- Responsive scaling (ResizeObserver for reliable initial layout) --- */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const cw = deviceConfig.canvasWidth
    const ch = deviceConfig.canvasHeight

    function applyScale() {
      const containerW = el!.clientWidth
      const containerH = el!.clientHeight
      // Guard: skip if container hasn't laid out yet (0×0)
      if (containerW < 1 || containerH < 1) return
      const scaleW = containerW / cw
      const scaleH = containerH / ch
      const newScale = Math.min(1, scaleW, scaleH)
      setDisplayScale(newScale)

      // Tell Fabric about the CSS size so pointer coordinates map correctly
      const canvas = canvasRef.current
      if (canvas) {
        canvas.setDimensions(
          { width: cw * newScale, height: ch * newScale },
          { cssOnly: true }
        )
      }
    }

    // ResizeObserver fires on initial layout AND on every size change
    const ro = new ResizeObserver(() => applyScale())
    ro.observe(el)

    return () => ro.disconnect()
  }, [deviceConfig.canvasWidth, deviceConfig.canvasHeight, canvasRef])

  const caseType = state.caseType

  const r = deviceConfig.cornerRadius
  const w = deviceConfig.canvasWidth * displayScale
  const h = deviceConfig.canvasHeight * displayScale

  /* ---- Case-type visual properties -------------------------------------- */
  const frameWidth = caseType === "tough" ? Math.max(3, 5 * displayScale)
    : caseType === "slim" ? Math.max(1, 1.5 * displayScale)
    : Math.max(2, 3 * displayScale) // clear & magsafe — normal

  const frameColor = caseType === "clear" ? "rgba(180,180,180,0.5)" : "#1a1a1a"

  /* ---- Render ----------------------------------------------------------- */
  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center w-full h-full"
    >
      {/* Phone frame wrapper */}
      <div
        className="relative"
        style={{ width: w, height: h }}
      >
        {/* Shadow behind the case */}
        <div
          className="absolute inset-0 bg-black/5"
          style={{
            borderRadius: r * displayScale,
            filter: "blur(20px)",
            transform: "translateY(8px)",
          }}
        />

        {/* Canvas container — use box-shadow instead of border so the
             content area stays exactly w×h and the clipPath aligns flush */}
        <div
          className="relative overflow-hidden"
          style={{
            width: w,
            height: h,
            borderRadius: r * displayScale,
            boxShadow: `0 0 0 ${frameWidth}px ${frameColor}`,
          }}
        >
          <canvas
            ref={canvasElRef}
          />

          {/* Device-specific camera module overlay */}
          <CameraOverlay config={deviceConfig} scale={displayScale} />

          {/* Case-type visual overlays */}
          <CaseTypeOverlay caseType={caseType} w={w} h={h} r={r * displayScale} s={displayScale} />
        </div>

        {/* Tough case: corner bumper accents outside the frame */}
        {caseType === "tough" && (
          <ToughCornerBumpers w={w} h={h} r={r * displayScale} s={displayScale} frameWidth={frameWidth} />
        )}
      </div>
    </div>
  )
}
