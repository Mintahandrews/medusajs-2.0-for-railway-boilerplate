"use client"

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react"
import { Canvas, Rect, FabricImage } from "fabric"
import type { DeviceTemplate } from "../types"

export type DesignerCanvasHandle = {
  getCanvas: () => Canvas | null
  exportImage: () => string | null
  exportJSON: () => string | null
  loadJSON: (json: string) => void
  setBackgroundColor: (color: string) => void
  addImage: (url: string) => Promise<void>
  addText: (text: string, options?: Record<string, any>) => void
}

type Props = {
  device: DeviceTemplate
  backgroundColor: string
  onCanvasReady?: (canvas: Canvas) => void
}

const DesignerCanvas = forwardRef<DesignerCanvasHandle, Props>(
  ({ device, backgroundColor, onCanvasReady }, ref) => {
    const canvasElRef = useRef<HTMLCanvasElement>(null)
    const fabricRef = useRef<Canvas | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

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

      return () => {
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
      // Dynamic import to avoid SSR issues with fabric's Textbox
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

    useImperativeHandle(ref, () => ({
      getCanvas: () => fabricRef.current,
      exportImage,
      exportJSON,
      loadJSON,
      setBackgroundColor,
      addImage,
      addText,
    }))

    return (
      <div ref={containerRef} className="relative inline-block">
        {/* Canvas */}
        <canvas ref={canvasElRef} />

        {/* Device outline overlay (non-interactive) */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={device.width}
          height={device.height}
          viewBox={`0 0 ${device.width} ${device.height}`}
        >
          {/* Outer mask — everything outside the case shape is darkened */}
          <defs>
            <mask id={`case-mask-${device.id}`}>
              <rect width={device.width} height={device.height} fill="white" />
              <rect
                x={device.inset.left}
                y={device.inset.top}
                width={device.width - device.inset.left - device.inset.right}
                height={device.height - device.inset.top - device.inset.bottom}
                rx={device.borderRadius * 0.6}
                ry={device.borderRadius * 0.6}
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width={device.width}
            height={device.height}
            fill="rgba(0,0,0,0.15)"
            mask={`url(#case-mask-${device.id})`}
          />

          {/* Case border */}
          <rect
            x={2}
            y={2}
            width={device.width - 4}
            height={device.height - 4}
            rx={device.borderRadius}
            ry={device.borderRadius}
            fill="none"
            stroke="rgba(0,0,0,0.25)"
            strokeWidth={2}
          />

          {/* Camera cutout */}
          {device.cameraCutout && (
            <rect
              x={device.cameraCutout.x}
              y={device.cameraCutout.y}
              width={device.cameraCutout.width}
              height={device.cameraCutout.height}
              rx={device.cameraCutout.radius}
              ry={device.cameraCutout.radius}
              fill="rgba(0,0,0,0.3)"
              stroke="rgba(0,0,0,0.4)"
              strokeWidth={1.5}
            />
          )}
        </svg>
      </div>
    )
  }
)

DesignerCanvas.displayName = "DesignerCanvas"

export default DesignerCanvas
