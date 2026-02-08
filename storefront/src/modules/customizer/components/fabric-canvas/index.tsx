"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import { useCustomizer } from "../../context"
import type { DeviceConfig } from "@lib/device-assets"

/* -------------------------------------------------------------------------- */
/*  Camera module overlay                                                      */
/* -------------------------------------------------------------------------- */

/** Determine camera family from device handle */
function getCameraFamily(handle: string): string {
  // iPhone mini / standard (dual lens diagonal)
  if (/iphone-\d+(-mini)?$/.test(handle) || /iphone-\d+-plus$/.test(handle))
    return "iphone-dual"
  // iPhone Pro / Pro Max (triple lens triangle)
  if (/iphone-\d+-pro/.test(handle)) return "iphone-triple"
  // Samsung Ultra (quad individual lenses)
  if (/samsung.*ultra/.test(handle)) return "samsung-ultra"
  // Samsung standard (triple individual lenses)
  if (/samsung/.test(handle)) return "samsung-triple"
  // Pixel (horizontal bar)
  if (/pixel/.test(handle)) return "pixel-bar"
  return "iphone-dual" // fallback
}

/** Render a single CSS lens circle */
function Lens({
  cx, cy, d, s, type = "lens",
}: {
  cx: number; cy: number; d: number; s: number
  type?: "lens" | "flash" | "sensor"
}) {
  if (type === "flash") {
    return (
      <div
        className="absolute rounded-full"
        style={{
          left: (cx - d / 2) * s,
          top: (cy - d / 2) * s,
          width: d * s,
          height: d * s,
          background: "radial-gradient(circle, #ffeebb 30%, #997744 100%)",
        }}
      />
    )
  }
  if (type === "sensor") {
    return (
      <div
        className="absolute rounded-full"
        style={{
          left: (cx - d / 2) * s,
          top: (cy - d / 2) * s,
          width: d * s,
          height: d * s,
          background: "#222",
        }}
      />
    )
  }
  return (
    <div
      className="absolute rounded-full"
      style={{
        left: (cx - d / 2) * s,
        top: (cy - d / 2) * s,
        width: d * s,
        height: d * s,
        background: "radial-gradient(circle, #1a1a3a 40%, #0d0d1a 70%, #333 100%)",
        boxShadow: `inset 0 0 ${3 * s}px rgba(100,100,255,0.15), 0 0 0 ${2 * s}px rgba(80,80,80,0.5)`,
      }}
    />
  )
}

/** Camera module overlay — positioned absolutely over the canvas container */
function CameraOverlay({ config, scale }: { config: DeviceConfig; scale: number }) {
  const family = getCameraFamily(config.handle)
  const cw = config.canvasWidth
  const s = scale // display scale

  // Module dimensions in canvas-pixels (before scaling)
  const modSize = Math.round(cw * 0.38)       // module width/height
  const modTop = Math.round(cw * 0.04)         // top offset
  const modLeft = Math.round(cw * 0.04)        // left offset
  const modR = Math.round(modSize * 0.28)       // module corner radius
  const lensD = Math.round(modSize * 0.33)      // lens diameter
  const flashD = Math.round(modSize * 0.09)     // flash diameter
  const sensorD = Math.round(modSize * 0.07)    // sensor diameter

  if (family === "iphone-dual") {
    // Dual diagonal lenses in square module
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: modTop * s,
          left: modLeft * s,
          width: modSize * s,
          height: modSize * s,
          borderRadius: modR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: `inset 0 0 0 ${2 * s}px rgba(60,60,60,0.5), 0 0 ${4 * s}px rgba(0,0,0,0.3)`,
        }}
      >
        <Lens cx={modSize * 0.36} cy={modSize * 0.36} d={lensD} s={s} />
        <Lens cx={modSize * 0.64} cy={modSize * 0.64} d={lensD} s={s} />
        <Lens cx={modSize * 0.64} cy={modSize * 0.36} d={flashD} s={s} type="flash" />
      </div>
    )
  }

  if (family === "iphone-triple") {
    // Triple lenses in triangle arrangement
    const bigMod = Math.round(cw * 0.42)
    const bigR = Math.round(bigMod * 0.26)
    const bigLens = Math.round(bigMod * 0.30)
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: modTop * s,
          left: modLeft * s,
          width: bigMod * s,
          height: bigMod * s,
          borderRadius: bigR * s,
          background: "rgba(0,0,0,0.88)",
          boxShadow: `inset 0 0 0 ${2 * s}px rgba(60,60,60,0.5), 0 0 ${4 * s}px rgba(0,0,0,0.3)`,
        }}
      >
        <Lens cx={bigMod * 0.34} cy={bigMod * 0.32} d={bigLens} s={s} />
        <Lens cx={bigMod * 0.66} cy={bigMod * 0.32} d={bigLens} s={s} />
        <Lens cx={bigMod * 0.50} cy={bigMod * 0.68} d={bigLens} s={s} />
        <Lens cx={bigMod * 0.66} cy={bigMod * 0.68} d={flashD} s={s} type="flash" />
        <Lens cx={bigMod * 0.34} cy={bigMod * 0.68} d={sensorD} s={s} type="sensor" />
      </div>
    )
  }

  if (family === "samsung-triple" || family === "samsung-ultra") {
    // Individual circles stacked vertically, upper-left area (Samsung style)
    const ld = Math.round(cw * 0.11)
    const gap = Math.round(cw * 0.13)
    const startY = Math.round(cw * 0.12)
    const cx = Math.round(cw * 0.27)
    const count = family === "samsung-ultra" ? 4 : 3
    return (
      <div className="absolute pointer-events-none z-10 inset-0">
        {Array.from({ length: count }).map((_, i) => (
          <Lens key={i} cx={cx} cy={startY + i * gap} d={ld} s={s} />
        ))}
        <Lens cx={cx} cy={startY + count * gap} d={flashD * 1.2} s={s} type="flash" />
      </div>
    )
  }

  if (family === "pixel-bar") {
    // Horizontal camera visor bar across upper back (Pixel style)
    const barH = Math.round(cw * 0.15)
    const barTop = Math.round(cw * 0.14)
    const ld = Math.round(barH * 0.60)
    return (
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: barTop * s,
          left: 0,
          width: cw * s,
          height: barH * s,
          background: "rgba(0,0,0,0.85)",
          borderRadius: (barH / 2) * s,
          boxShadow: `inset 0 0 0 ${2 * s}px rgba(60,60,60,0.4)`,
        }}
      >
        <Lens cx={cw * 0.28} cy={barH * 0.50} d={ld} s={s} />
        <Lens cx={cw * 0.50} cy={barH * 0.50} d={ld} s={s} />
        <Lens cx={cw * 0.72} cy={barH * 0.50} d={flashD * 1.5} s={s} type="flash" />
      </div>
    )
  }

  return null
}

/**
 * The core Fabric.js canvas component.
 */
export default function FabricCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const {
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

  /* ---- Responsive scaling ----------------------------------------------- */
  useEffect(() => {
    function handleResize() {
      if (!containerRef.current) return
      const containerW = containerRef.current.clientWidth
      const containerH = containerRef.current.clientHeight
      const scaleW = containerW / deviceConfig.canvasWidth
      const scaleH = containerH / deviceConfig.canvasHeight
      // fit inside container on both axes, cap at 1×
      setDisplayScale(Math.min(1, scaleW, scaleH))
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [deviceConfig.canvasWidth, deviceConfig.canvasHeight])

  const r = deviceConfig.cornerRadius
  const w = deviceConfig.canvasWidth * displayScale
  const h = deviceConfig.canvasHeight * displayScale

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

        {/* Canvas container */}
        <div
          className="relative overflow-hidden bg-white"
          style={{
            width: w,
            height: h,
            borderRadius: r * displayScale,
            border: `${Math.max(2, 3 * displayScale)}px solid #1a1a1a`,
          }}
        >
          <canvas
            ref={canvasElRef}
            style={{
              transformOrigin: "top left",
              transform: `scale(${displayScale})`,
              width: deviceConfig.canvasWidth,
              height: deviceConfig.canvasHeight,
            }}
          />

          {/* Device-specific camera module overlay */}
          <CameraOverlay config={deviceConfig} scale={displayScale} />
        </div>
      </div>
    </div>
  )
}
