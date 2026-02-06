"use client"

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react"
import { Canvas, Rect, FabricImage, Gradient } from "fabric"
import type { DeviceTemplate } from "../types"

export type DesignerCanvasHandle = {
  getCanvas: () => Canvas | null
  exportImage: () => string | null
  exportJSON: () => string | null
  loadJSON: (json: string) => void
  setBackgroundColor: (color: string) => void
  setGradientBackground: (colors: string[]) => void
  addImage: (url: string) => Promise<void>
  addText: (text: string, options?: Record<string, any>) => void
  addSticker: (emoji: string) => void
  undo: () => void
  redo: () => void
}

type Props = {
  device: DeviceTemplate
  backgroundColor: string
  onCanvasReady?: (canvas: Canvas) => void
  onObjectCount?: (count: number) => void
}

const DesignerCanvas = forwardRef<DesignerCanvasHandle, Props>(
  ({ device, backgroundColor, onCanvasReady, onObjectCount }, ref) => {
    const canvasElRef = useRef<HTMLCanvasElement>(null)
    const fabricRef = useRef<Canvas | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const historyRef = useRef<string[]>([])
    const historyIndexRef = useRef(-1)
    const isRestoringRef = useRef(false)

    const saveHistory = useCallback(() => {
      const canvas = fabricRef.current
      if (!canvas || isRestoringRef.current) return
      const json = JSON.stringify(canvas.toJSON())
      const idx = historyIndexRef.current
      historyRef.current = historyRef.current.slice(0, idx + 1)
      historyRef.current.push(json)
      if (historyRef.current.length > 30) historyRef.current.shift()
      historyIndexRef.current = historyRef.current.length - 1
    }, [])

    const notifyCount = useCallback(() => {
      const canvas = fabricRef.current
      if (!canvas) return
      onObjectCount?.(canvas.getObjects().length)
    }, [onObjectCount])

    // Initialize canvas
    useEffect(() => {
      if (!canvasElRef.current) return

      const canvas = new Canvas(canvasElRef.current, {
        width: device.width,
        height: device.height,
        backgroundColor,
        selection: true,
        preserveObjectStacking: true,
      })

      fabricRef.current = canvas
      onCanvasReady?.(canvas)

      // Save initial state
      historyRef.current = [JSON.stringify(canvas.toJSON())]
      historyIndexRef.current = 0

      // Track changes for undo/redo
      const onChange = () => { saveHistory(); notifyCount() }
      canvas.on("object:added", onChange)
      canvas.on("object:removed", onChange)
      canvas.on("object:modified", onChange)

      return () => {
        canvas.off("object:added", onChange)
        canvas.off("object:removed", onChange)
        canvas.off("object:modified", onChange)
        canvas.dispose()
        fabricRef.current = null
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [device.id])

    // Update background color
    useEffect(() => {
      const canvas = fabricRef.current
      if (!canvas) return
      canvas.backgroundColor = backgroundColor
      canvas.renderAll()
    }, [backgroundColor])

    // Update canvas dimensions when device changes
    useEffect(() => {
      const canvas = fabricRef.current
      if (!canvas) return
      canvas.setDimensions({ width: device.width, height: device.height })
      canvas.renderAll()
    }, [device.width, device.height])

    const exportImage = useCallback((): string | null => {
      const canvas = fabricRef.current
      if (!canvas) return null
      return canvas.toDataURL({ format: "png", quality: 1, multiplier: 2 })
    }, [])

    const exportJSON = useCallback((): string | null => {
      const canvas = fabricRef.current
      if (!canvas) return null
      return JSON.stringify(canvas.toJSON())
    }, [])

    const loadJSON = useCallback((json: string) => {
      const canvas = fabricRef.current
      if (!canvas) return
      canvas.loadFromJSON(json).then(() => {
        canvas.renderAll()
      })
    }, [])

    const setBackgroundColor = useCallback((color: string) => {
      const canvas = fabricRef.current
      if (!canvas) return
      canvas.backgroundColor = color
      canvas.renderAll()
    }, [])

    const setGradientBackground = useCallback((colors: string[]) => {
      const canvas = fabricRef.current
      if (!canvas) return
      // Add a full-size gradient rect as the first object
      const existing = canvas.getObjects().find((o: any) => o._isGradientBg)
      if (existing) canvas.remove(existing)
      const gradRect = new Rect({
        left: 0,
        top: 0,
        width: device.width,
        height: device.height,
        selectable: false,
        evented: false,
        hoverCursor: "default",
      })
      ;(gradRect as any)._isGradientBg = true
      const colorStops = colors.map((c, i) => ({
        offset: i / Math.max(colors.length - 1, 1),
        color: c,
      }))
      gradRect.set("fill", new Gradient({
        type: "linear",
        coords: { x1: 0, y1: 0, x2: device.width, y2: device.height },
        colorStops,
      }))
      canvas.insertAt(0, gradRect)
      canvas.backgroundColor = "transparent"
      canvas.renderAll()
    }, [device.width, device.height])

    const addImage = useCallback(async (url: string) => {
      const canvas = fabricRef.current
      if (!canvas) return
      const img = await FabricImage.fromURL(url, { crossOrigin: "anonymous" })
      const printW = device.width - device.inset.left - device.inset.right
      const printH = device.height - device.inset.top - device.inset.bottom
      const scale = Math.min(printW / (img.width || 1), printH / (img.height || 1)) * 0.8
      img.set({
        left: device.width / 2,
        top: device.height / 2,
        originX: "center",
        originY: "center",
        scaleX: scale,
        scaleY: scale,
      })
      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
    }, [device])

    const addText = useCallback((text: string, options: Record<string, any> = {}) => {
      const canvas = fabricRef.current
      if (!canvas) return
      import("fabric").then(({ Textbox }) => {
        const textbox = new Textbox(text, {
          left: device.width / 2,
          top: device.height / 2,
          originX: "center",
          originY: "center",
          fontSize: 28,
          fontFamily: "Inter, sans-serif",
          fill: "#000000",
          textAlign: "center",
          width: device.width * 0.6,
          ...options,
        })
        canvas.add(textbox)
        canvas.setActiveObject(textbox)
        canvas.renderAll()
      })
    }, [device])

    const addSticker = useCallback((emoji: string) => {
      const canvas = fabricRef.current
      if (!canvas) return
      import("fabric").then(({ Textbox }) => {
        const sticker = new Textbox(emoji, {
          left: device.width / 2 + (Math.random() - 0.5) * 60,
          top: device.height / 2 + (Math.random() - 0.5) * 60,
          originX: "center",
          originY: "center",
          fontSize: 48,
          width: 60,
          textAlign: "center",
        })
        canvas.add(sticker)
        canvas.setActiveObject(sticker)
        canvas.renderAll()
      })
    }, [device])

    const undo = useCallback(() => {
      const canvas = fabricRef.current
      if (!canvas || historyIndexRef.current <= 0) return
      isRestoringRef.current = true
      historyIndexRef.current -= 1
      const json = historyRef.current[historyIndexRef.current]
      canvas.loadFromJSON(json).then(() => {
        canvas.renderAll()
        isRestoringRef.current = false
        notifyCount()
      })
    }, [notifyCount])

    const redo = useCallback(() => {
      const canvas = fabricRef.current
      if (!canvas || historyIndexRef.current >= historyRef.current.length - 1) return
      isRestoringRef.current = true
      historyIndexRef.current += 1
      const json = historyRef.current[historyIndexRef.current]
      canvas.loadFromJSON(json).then(() => {
        canvas.renderAll()
        isRestoringRef.current = false
        notifyCount()
      })
    }, [notifyCount])

    useImperativeHandle(ref, () => ({
      getCanvas: () => fabricRef.current,
      exportImage,
      exportJSON,
      loadJSON,
      setBackgroundColor,
      setGradientBackground,
      addImage,
      addText,
      addSticker,
      undo,
      redo,
    }))

    const W = device.width
    const H = device.height
    const R = device.borderRadius
    const uid = device.id

    return (
      <div ref={containerRef} className="relative inline-block" style={{ filter: "drop-shadow(0 8px 30px rgba(0,0,0,0.18))" }}>
        {/* Canvas */}
        <canvas ref={canvasElRef} style={{ borderRadius: R * 0.6 }} />

        {/* Realistic device overlay (non-interactive) */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
        >
          <defs>
            {/* Outer mask — hides content outside the case shape */}
            <mask id={`case-mask-${uid}`}>
              <rect width={W} height={H} fill="white" />
              <rect
                x={device.inset.left}
                y={device.inset.top}
                width={W - device.inset.left - device.inset.right}
                height={H - device.inset.top - device.inset.bottom}
                rx={R * 0.55}
                ry={R * 0.55}
                fill="black"
              />
            </mask>

            {/* Highlight gradient for 3D effect */}
            <linearGradient id={`case-highlight-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0.12" />
              <stop offset="50%" stopColor="white" stopOpacity="0" />
              <stop offset="100%" stopColor="black" stopOpacity="0.06" />
            </linearGradient>

            {/* Camera lens gradient */}
            <radialGradient id={`lens-grad-${uid}`} cx="35%" cy="35%">
              <stop offset="0%" stopColor="#555" />
              <stop offset="40%" stopColor="#222" />
              <stop offset="70%" stopColor="#111" />
              <stop offset="100%" stopColor="#000" />
            </radialGradient>

            {/* Lens reflection */}
            <radialGradient id={`lens-reflect-${uid}`} cx="30%" cy="30%">
              <stop offset="0%" stopColor="white" stopOpacity="0.5" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Case bezel area (darkened outside print area) */}
          <rect
            width={W}
            height={H}
            fill="rgba(0,0,0,0.12)"
            mask={`url(#case-mask-${uid})`}
          />

          {/* Case outer border with subtle 3D */}
          <rect
            x={1}
            y={1}
            width={W - 2}
            height={H - 2}
            rx={R}
            ry={R}
            fill="none"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth={2.5}
          />
          {/* Inner highlight border */}
          <rect
            x={3}
            y={3}
            width={W - 6}
            height={H - 6}
            rx={R - 2}
            ry={R - 2}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
          />

          {/* 3D highlight overlay on the entire case */}
          <rect
            x={1}
            y={1}
            width={W - 2}
            height={H - 2}
            rx={R}
            ry={R}
            fill={`url(#case-highlight-${uid})`}
          />

          {/* Side buttons */}
          {device.sideButtons?.map((btn, i) => {
            const x = btn.side === "right" ? W - 1 : -3
            return (
              <rect
                key={`btn-${i}`}
                x={x}
                y={btn.y}
                width={4}
                height={btn.height}
                rx={2}
                fill="rgba(0,0,0,0.25)"
              />
            )
          })}

          {/* Camera module background */}
          {device.cameraCutout && (
            <g>
              <rect
                x={device.cameraCutout.x}
                y={device.cameraCutout.y}
                width={device.cameraCutout.width}
                height={device.cameraCutout.height}
                rx={device.cameraCutout.radius}
                ry={device.cameraCutout.radius}
                fill="rgba(20,20,20,0.85)"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={1.5}
              />
              {/* Glass sheen on camera module */}
              <rect
                x={device.cameraCutout.x + 2}
                y={device.cameraCutout.y + 2}
                width={device.cameraCutout.width - 4}
                height={device.cameraCutout.height * 0.4}
                rx={device.cameraCutout.radius - 2}
                fill="rgba(255,255,255,0.06)"
              />
            </g>
          )}

          {/* Camera lenses — realistic circles */}
          {device.cameraLenses?.map((lens, i) => (
            <g key={`lens-${i}`}>
              {/* Outer ring */}
              <circle cx={lens.cx} cy={lens.cy} r={lens.r + 2} fill="rgba(0,0,0,0.4)" />
              {/* Lens body */}
              <circle cx={lens.cx} cy={lens.cy} r={lens.r} fill={`url(#lens-grad-${uid})`} />
              {/* Inner ring */}
              <circle cx={lens.cx} cy={lens.cy} r={lens.r * 0.65} fill="rgba(10,10,30,0.9)" stroke="rgba(60,60,80,0.5)" strokeWidth={0.5} />
              {/* Lens reflection */}
              <circle cx={lens.cx - lens.r * 0.15} cy={lens.cy - lens.r * 0.15} r={lens.r * 0.4} fill={`url(#lens-reflect-${uid})`} />
              {/* Tiny center dot */}
              <circle cx={lens.cx} cy={lens.cy} r={1.5} fill="rgba(30,30,60,0.8)" />
            </g>
          ))}

          {/* If no cameraLenses, fall back to simple cutout */}
          {!device.cameraLenses && device.cameraCutout && (
            <circle
              cx={device.cameraCutout.x + device.cameraCutout.width / 2}
              cy={device.cameraCutout.y + device.cameraCutout.height / 2}
              r={Math.min(device.cameraCutout.width, device.cameraCutout.height) / 2 - 4}
              fill={`url(#lens-grad-${uid})`}
              stroke="rgba(0,0,0,0.4)"
              strokeWidth={2}
            />
          )}
        </svg>
      </div>
    )
  }
)

DesignerCanvas.displayName = "DesignerCanvas"

export default DesignerCanvas
