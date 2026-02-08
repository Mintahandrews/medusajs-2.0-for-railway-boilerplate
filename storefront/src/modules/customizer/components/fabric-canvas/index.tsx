"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import { useCustomizer } from "../../context"

/**
 * The core Fabric.js canvas component.
 *
 * Responsibilities:
 * 1. Initialise a `fabric.Canvas` on mount (dynamic import to dodge SSR).
 * 2. Apply the device's editor mask path as a `clipPath` so designs stay
 *    inside the phone outline.
 * 3. Load the realistic overlay PNG as `canvas.overlayImage` (renders on
 *    top of everything but is not selectable / part of the object list).
 * 4. Forward object-modified events to the history stack.
 * 5. Responsively scale the canvas display to fit its container.
 * 6. Keyboard shortcuts: Delete/Backspace, Ctrl+Z, Ctrl+Y / Ctrl+Shift+Z.
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

      /* 3. Load realistic overlay (URL-encoded for paths with spaces) ------- */
      try {
        const encodedUrl = encodeURI(deviceConfig.overlayUrl)
        const overlayImg = await fabric.FabricImage.fromURL(encodedUrl, {
          crossOrigin: "anonymous",
        })
        if (disposed) return

        overlayImg.set({
          originX: "left",
          originY: "top",
          left: 0,
          top: 0,
          scaleX: canvasWidth / (overlayImg.width || canvasWidth),
          scaleY: canvasHeight / (overlayImg.height || canvasHeight),
        })
        fabricCanvas.overlayImage = overlayImg
      } catch {
        console.warn("[Customizer] Could not load overlay image — using CSS frame instead")
      }

      /* 4. Touch / mobile support ------------------------------------------- */
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

        </div>
      </div>
    </div>
  )
}
