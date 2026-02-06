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
    const D = device.caseDepth || 8
    const uid = device.id

    // Case edge thickness for the visual frame
    const EDGE = 4
    // Total SVG with space for 3D edges + side buttons
    const PAD = D + 8
    const svgW = W + PAD * 2
    const svgH = H + PAD * 2

    // Camera cutout shorthand
    const cc = device.cameraCutout

    return (
      <div ref={containerRef} className="relative inline-block">
        {/* Canvas positioned inside the case area */}
        <div style={{ padding: PAD }}>
          <canvas ref={canvasElRef} style={{ borderRadius: R - 2, display: "block" }} />
        </div>

        {/* === REALISTIC PHONE CASE OVERLAY === */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
        >
          <defs>
            {/* Case body clip */}
            <clipPath id={`body-${uid}`}>
              <rect x={PAD} y={PAD} width={W} height={H} rx={R} ry={R} />
            </clipPath>

            {/* Mask: everything OUTSIDE the case shape is covered */}
            <mask id={`outer-mask-${uid}`}>
              <rect width={svgW} height={svgH} fill="black" />
              <rect x={PAD} y={PAD} width={W} height={H} rx={R} ry={R} fill="white" />
            </mask>

            {/* Case edge gradients for 3D depth */}
            <linearGradient id={`edgeT-${uid}`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#d0d0d0" />
              <stop offset="100%" stopColor="#b0b0b0" />
            </linearGradient>
            <linearGradient id={`edgeB-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bbb" />
              <stop offset="100%" stopColor="#888" />
            </linearGradient>
            <linearGradient id={`edgeL-${uid}`} x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#ccc" />
              <stop offset="100%" stopColor="#999" />
            </linearGradient>
            <linearGradient id={`edgeR-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#d5d5d5" />
              <stop offset="100%" stopColor="#aaa" />
            </linearGradient>

            {/* Surface highlight for 3D feel */}
            <linearGradient id={`surf-${uid}`} x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0.15" />
              <stop offset="25%" stopColor="white" stopOpacity="0.03" />
              <stop offset="75%" stopColor="black" stopOpacity="0" />
              <stop offset="100%" stopColor="black" stopOpacity="0.06" />
            </linearGradient>

            {/* Camera module interior */}
            <linearGradient id={`cam-int-${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#1e1e24" />
              <stop offset="100%" stopColor="#0a0a10" />
            </linearGradient>

            {/* Lens gradients */}
            <radialGradient id={`lens-${uid}`} cx="38%" cy="38%">
              <stop offset="0%" stopColor="#5a5a6a" />
              <stop offset="30%" stopColor="#2a2a38" />
              <stop offset="60%" stopColor="#15151e" />
              <stop offset="100%" stopColor="#08080c" />
            </radialGradient>
            <radialGradient id={`lref-${uid}`} cx="30%" cy="30%">
              <stop offset="0%" stopColor="white" stopOpacity="0.6" />
              <stop offset="50%" stopColor="white" stopOpacity="0.1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>

            {/* Drop shadow filter */}
            <filter id={`shadow-${uid}`} x="-10%" y="-5%" width="120%" height="120%">
              <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#000" floodOpacity="0.2" />
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.1" />
            </filter>
          </defs>

          {/* === CASE SHADOW (underneath) === */}
          <rect
            x={PAD + 4}
            y={PAD + 6}
            width={W - 8}
            height={H - 4}
            rx={R}
            ry={R}
            fill="rgba(0,0,0,0.15)"
            filter={`url(#shadow-${uid})`}
          />

          {/* === 3D DEPTH EDGES (case thickness visible from slight top-down view) === */}
          {/* Bottom edge — most visible */}
          <path
            d={`M${PAD + R},${PAD + H} L${PAD + R},${PAD + H + D} Q${PAD + R},${PAD + H + D + 2} ${PAD + R + 4},${PAD + H + D + 2} L${PAD + W - R - 4},${PAD + H + D + 2} Q${PAD + W - R},${PAD + H + D + 2} ${PAD + W - R},${PAD + H + D} L${PAD + W - R},${PAD + H}`}
            fill={`url(#edgeB-${uid})`}
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={0.5}
          />
          {/* Right edge */}
          <rect
            x={PAD + W}
            y={PAD + R + 4}
            width={D - 2}
            height={H - R * 2 - 8}
            rx={2}
            fill={`url(#edgeR-${uid})`}
          />
          {/* Left edge */}
          <rect
            x={PAD - D + 2}
            y={PAD + R + 4}
            width={D - 2}
            height={H - R * 2 - 8}
            rx={2}
            fill={`url(#edgeL-${uid})`}
          />

          {/* === CASE BODY BORDER (main outline) === */}
          {/* Outer border — case shell edge */}
          <rect
            x={PAD}
            y={PAD}
            width={W}
            height={H}
            rx={R}
            ry={R}
            fill="none"
            stroke="#a8a8a8"
            strokeWidth={EDGE}
          />
          {/* Inner highlight line (light source top-left) */}
          <rect
            x={PAD + EDGE * 0.5}
            y={PAD + EDGE * 0.5}
            width={W - EDGE}
            height={H - EDGE}
            rx={R - 1}
            ry={R - 1}
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={0.8}
          />
          {/* Outer shadow line (bottom-right) */}
          <rect
            x={PAD - 0.5}
            y={PAD - 0.5}
            width={W + 1}
            height={H + 1}
            rx={R + 0.5}
            ry={R + 0.5}
            fill="none"
            stroke="rgba(0,0,0,0.15)"
            strokeWidth={1}
          />

          {/* === SURFACE HIGHLIGHT/SHADOW OVERLAY === */}
          <rect
            x={PAD}
            y={PAD}
            width={W}
            height={H}
            rx={R}
            ry={R}
            fill={`url(#surf-${uid})`}
            clipPath={`url(#body-${uid})`}
          />

          {/* === SIDE BUTTONS === */}
          {device.sideButtons?.map((btn, i) => {
            const isRight = btn.side === "right"
            const bx = isRight ? PAD + W - 1 : PAD - D + 1
            const bw = D
            return (
              <g key={`btn-${i}`}>
                <rect
                  x={bx}
                  y={PAD + btn.y}
                  width={bw}
                  height={btn.height}
                  rx={2}
                  fill={isRight ? "#b0b0b0" : "#b8b8b8"}
                  stroke={isRight ? "#999" : "#a0a0a0"}
                  strokeWidth={0.5}
                />
                {/* Top highlight */}
                <rect
                  x={bx + 1}
                  y={PAD + btn.y + 0.5}
                  width={bw - 2}
                  height={2}
                  rx={1}
                  fill="rgba(255,255,255,0.25)"
                />
              </g>
            )
          })}

          {/* === CAMERA MODULE (cutout hole in case) === */}
          {cc && (
            <g clipPath={`url(#body-${uid})`}>
              {/* Camera cutout raised ring (case material lip around the hole) */}
              <rect
                x={PAD + cc.x - 5}
                y={PAD + cc.y - 5}
                width={cc.width + 10}
                height={cc.height + 10}
                rx={cc.radius + 5}
                ry={cc.radius + 5}
                fill="none"
                stroke="rgba(0,0,0,0.06)"
                strokeWidth={3}
              />
              <rect
                x={PAD + cc.x - 3}
                y={PAD + cc.y - 3}
                width={cc.width + 6}
                height={cc.height + 6}
                rx={cc.radius + 3}
                ry={cc.radius + 3}
                fill="none"
                stroke="rgba(180,180,180,0.5)"
                strokeWidth={1.5}
              />

              {/* Camera cutout interior — dark phone back visible through the hole */}
              <rect
                x={PAD + cc.x}
                y={PAD + cc.y}
                width={cc.width}
                height={cc.height}
                rx={cc.radius}
                ry={cc.radius}
                fill={`url(#cam-int-${uid})`}
                stroke="rgba(40,40,50,0.7)"
                strokeWidth={1.5}
              />
              {/* Inner shadow ring for depth effect */}
              <rect
                x={PAD + cc.x + 1.5}
                y={PAD + cc.y + 1.5}
                width={cc.width - 3}
                height={cc.height - 3}
                rx={cc.radius - 1}
                ry={cc.radius - 1}
                fill="none"
                stroke="rgba(0,0,0,0.2)"
                strokeWidth={2}
              />
              {/* Glass sheen across camera module */}
              <rect
                x={PAD + cc.x + 4}
                y={PAD + cc.y + 3}
                width={cc.width - 8}
                height={cc.height * 0.25}
                rx={cc.radius - 3}
                fill="rgba(255,255,255,0.06)"
              />
            </g>
          )}

          {/* === CAMERA LENSES (inside the cutout) === */}
          {device.cameraLenses?.map((lens, i) => (
            <g key={`lens-${i}`} clipPath={`url(#body-${uid})`}>
              {/* Lens shadow */}
              <circle cx={PAD + lens.cx} cy={PAD + lens.cy + 1} r={lens.r + 4} fill="rgba(0,0,0,0.25)" />
              {/* Chrome bezel ring */}
              <circle cx={PAD + lens.cx} cy={PAD + lens.cy} r={lens.r + 4} fill="none" stroke="#555" strokeWidth={2} />
              <circle cx={PAD + lens.cx} cy={PAD + lens.cy} r={lens.r + 2} fill="none" stroke="#777" strokeWidth={0.8} />
              {/* Lens body */}
              <circle cx={PAD + lens.cx} cy={PAD + lens.cy} r={lens.r} fill={`url(#lens-${uid})`} />
              {/* Inner ring (aperture) */}
              <circle cx={PAD + lens.cx} cy={PAD + lens.cy} r={lens.r * 0.55} fill="rgba(6,6,18,0.9)" stroke="rgba(40,40,60,0.5)" strokeWidth={0.5} />
              {/* Reflection highlight */}
              <circle cx={PAD + lens.cx - lens.r * 0.2} cy={PAD + lens.cy - lens.r * 0.2} r={lens.r * 0.35} fill={`url(#lref-${uid})`} />
              {/* Center element */}
              <circle cx={PAD + lens.cx} cy={PAD + lens.cy} r={1.5} fill="rgba(15,15,30,0.6)" />
            </g>
          ))}

          {/* === FLASH & SENSORS (Apple devices) === */}
          {device.brand === "Apple" && cc && (
            <g clipPath={`url(#body-${uid})`}>
              {/* Flash LED */}
              <circle
                cx={PAD + cc.x + 16}
                cy={PAD + cc.y + cc.height - 16}
                r={5.5}
                fill="#ffeedd"
                opacity={0.35}
              />
              <circle
                cx={PAD + cc.x + 16}
                cy={PAD + cc.y + cc.height - 16}
                r={5.5}
                fill="none"
                stroke="#998866"
                strokeWidth={0.5}
              />
              {/* LiDAR / Microphone */}
              <circle
                cx={PAD + cc.x + cc.width - 16}
                cy={PAD + cc.y + cc.height - 16}
                r={4}
                fill="#111118"
                stroke="#333"
                strokeWidth={0.5}
              />
            </g>
          )}

          {/* === SAMSUNG individual lens surrounds === */}
          {device.brand === "Samsung" && cc && (
            <g clipPath={`url(#body-${uid})`}>
              {device.cameraLenses?.map((lens, i) => (
                <circle
                  key={`sr-${i}`}
                  cx={PAD + lens.cx}
                  cy={PAD + lens.cy}
                  r={lens.r + 6}
                  fill="none"
                  stroke="rgba(60,60,70,0.3)"
                  strokeWidth={1}
                />
              ))}
            </g>
          )}
        </svg>
      </div>
    )
  }
)

DesignerCanvas.displayName = "DesignerCanvas"

export default DesignerCanvas
