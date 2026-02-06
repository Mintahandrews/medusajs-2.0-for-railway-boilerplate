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

    // Padding around canvas for the case border
    const PAD = 12
    const svgW = W + PAD * 2
    const svgH = H + PAD * 2

    // Camera cutout
    const cc = device.cameraCutout

    return (
      <div ref={containerRef} className="relative inline-block">
        {/* Canvas positioned inside the case outline */}
        <div style={{ padding: PAD }}>
          <canvas ref={canvasElRef} style={{ borderRadius: R - 2, display: "block" }} />
        </div>

        {/* === CLEAN CASE CUTOUT OVERLAY === */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
        >
          <defs>
            {/* Clip to case body */}
            <clipPath id={`body-${uid}`}>
              <rect x={PAD} y={PAD} width={W} height={H} rx={R} ry={R} />
            </clipPath>
          </defs>

          {/* Case outline — clean thin border */}
          <rect
            x={PAD}
            y={PAD}
            width={W}
            height={H}
            rx={R}
            ry={R}
            fill="none"
            stroke="#c0c0c0"
            strokeWidth={2.5}
          />

          {/* Camera cutout — simple dark hole */}
          {cc && (
            <rect
              x={PAD + cc.x}
              y={PAD + cc.y}
              width={cc.width}
              height={cc.height}
              rx={cc.radius}
              ry={cc.radius}
              fill="#1a1a1e"
              stroke="#999"
              strokeWidth={1}
              clipPath={`url(#body-${uid})`}
            />
          )}
        </svg>
      </div>
    )
  }
)

DesignerCanvas.displayName = "DesignerCanvas"

export default DesignerCanvas
