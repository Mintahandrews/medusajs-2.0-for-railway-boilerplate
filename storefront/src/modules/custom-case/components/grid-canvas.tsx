"use client"

import { useState } from "react"
import { DeviceTemplate, GridLayout, PhotoItem } from "../types"
import { Plus, ImagePlus, X } from "lucide-react"

type GridCanvasProps = {
  device: DeviceTemplate
  layout: GridLayout
  photos: PhotoItem[]
  backgroundColor: string
  gridGap: number
  selectedSlotId: string | null
  onSlotClick: (slotId: string) => void
  onDropPhoto: (slotId: string, photoId: string) => void
  onRemoveFromSlot: (slotId: string) => void
}

export default function GridCanvas({
  device,
  layout,
  photos,
  backgroundColor,
  gridGap,
  selectedSlotId,
  onSlotClick,
  onDropPhoto,
  onRemoveFromSlot,
}: GridCanvasProps) {
  const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null)

  const borderRadiusPct = ((device.borderRadius / device.width) * 100).toFixed(1)

  return (
    <div className="relative w-full flex items-center justify-center select-none">
      {/* Phone Case Frame */}
      <div
        className="relative w-full"
        style={{
          aspectRatio: `${device.width} / ${device.height}`,
          maxWidth: 360,
        }}
      >
        {/* Outer shadow for depth */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: `${borderRadiusPct}%`,
            boxShadow:
              "0 25px 60px -12px rgba(0,0,0,0.25), 0 8px 20px -6px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)",
          }}
        />

        {/* Case body */}
        <div
          className="relative w-full h-full overflow-hidden"
          style={{
            borderRadius: `${borderRadiusPct}%`,
            backgroundColor,
          }}
        >
          {/* Grid layout */}
          <div className="absolute inset-0" style={{ padding: `${gridGap}px` }}>
            {layout.slots.map((slot) => {
              const photo = photos.find((p) => p.slotId === slot.id)
              const isSelected = selectedSlotId === slot.id
              const isDragOver = dragOverSlotId === slot.id

              return (
                <div
                  key={slot.id}
                  onClick={(e) => { e.stopPropagation(); onSlotClick(slot.id) }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = "copy"
                    setDragOverSlotId(slot.id)
                  }}
                  onDragLeave={() => setDragOverSlotId(null)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOverSlotId(null)
                    const photoId = e.dataTransfer.getData("photoId")
                    if (photoId) onDropPhoto(slot.id, photoId)
                  }}
                  className={`absolute overflow-hidden cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "ring-2 ring-blue-500 ring-offset-1 z-10"
                      : isDragOver
                      ? "ring-2 ring-green-400 ring-offset-1 z-10"
                      : ""
                  }`}
                  style={{
                    left: `calc(${slot.x}% + ${gridGap / 2}px)`,
                    top: `calc(${slot.y}% + ${gridGap / 2}px)`,
                    width: `calc(${slot.width}% - ${gridGap}px)`,
                    height: `calc(${slot.height}% - ${gridGap}px)`,
                    borderRadius: gridGap > 0 ? `${Math.min(gridGap * 2, 12)}px` : "0px",
                  }}
                >
                  {photo ? (
                    <div className="relative w-full h-full group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt="Custom"
                        className="w-full h-full object-cover pointer-events-none"
                        style={{
                          transform: `scale(${photo.zoom || 1}) translate(${photo.panX || 0}px, ${photo.panY || 0}px) rotate(${photo.rotation || 0}deg)`,
                        }}
                        draggable={false}
                      />
                      {/* Remove button on hover */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onRemoveFromSlot(slot.id) }}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <X size={10} />
                      </button>
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" />
                      )}
                    </div>
                  ) : (
                    <div
                      className={`w-full h-full flex flex-col items-center justify-center transition-all duration-200 ${
                        isDragOver
                          ? "bg-green-100 text-green-600"
                          : isSelected
                          ? "bg-blue-50 text-blue-400"
                          : "bg-white/60 text-gray-300 hover:bg-white/80 hover:text-gray-400"
                      }`}
                    >
                      <div className={`rounded-full flex items-center justify-center mb-1 transition-all ${
                        isDragOver ? "bg-green-200 h-8 w-8" : "bg-gray-100 h-7 w-7"
                      }`}>
                        {isDragOver ? <ImagePlus size={14} /> : <Plus size={14} />}
                      </div>
                      <span className="text-[8px] font-semibold uppercase tracking-wider">
                        {isDragOver ? "Drop here" : "Add photo"}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Camera overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: `${borderRadiusPct}%` }}>
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${device.width} ${device.height}`}
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0"
          >
            <defs>
              <linearGradient id={`cam-grad-${device.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(30,30,30,0.95)" />
                <stop offset="100%" stopColor="rgba(50,50,50,0.9)" />
              </linearGradient>
              <radialGradient id={`lens-grad-${device.id}`} cx="35%" cy="35%">
                <stop offset="0%" stopColor="rgba(80,80,80,0.6)" />
                <stop offset="40%" stopColor="rgba(20,20,20,0.95)" />
                <stop offset="100%" stopColor="rgba(10,10,10,0.98)" />
              </radialGradient>
            </defs>

            {/* Camera module background */}
            {device.cameraCutout && device.cameraStyle !== "individual" && (
              <rect
                x={device.cameraCutout.x}
                y={device.cameraCutout.y}
                width={device.cameraCutout.width}
                height={device.cameraCutout.height}
                rx={device.cameraCutout.radius}
                ry={device.cameraCutout.radius}
                fill={`url(#cam-grad-${device.id})`}
                stroke="rgba(60,60,60,0.5)"
                strokeWidth={1.5}
              />
            )}

            {/* Lenses */}
            {device.cameraLenses?.map((lens, i) => (
              <g key={i}>
                {/* Lens ring */}
                <circle cx={lens.cx} cy={lens.cy} r={lens.r + 3} fill="rgba(40,40,40,0.9)" />
                <circle cx={lens.cx} cy={lens.cy} r={lens.r + 1.5} fill="rgba(60,60,60,0.4)" stroke="rgba(80,80,80,0.3)" strokeWidth={0.5} />
                {/* Lens glass */}
                <circle cx={lens.cx} cy={lens.cy} r={lens.r} fill={`url(#lens-grad-${device.id})`} />
                {/* Lens reflection */}
                <circle cx={lens.cx - lens.r * 0.25} cy={lens.cy - lens.r * 0.25} r={lens.r * 0.2} fill="rgba(255,255,255,0.15)" />
              </g>
            ))}

            {/* Individual lens style (Samsung) */}
            {device.cameraStyle === "individual" && device.cameraLenses?.map((lens, i) => (
              <g key={`ind-${i}`}>
                <circle cx={lens.cx} cy={lens.cy} r={lens.r + 4} fill="rgba(40,40,40,0.85)" />
                <circle cx={lens.cx} cy={lens.cy} r={lens.r + 2} fill="rgba(50,50,50,0.5)" stroke="rgba(70,70,70,0.3)" strokeWidth={0.5} />
                <circle cx={lens.cx} cy={lens.cy} r={lens.r} fill={`url(#lens-grad-${device.id})`} />
                <circle cx={lens.cx - lens.r * 0.2} cy={lens.cy - lens.r * 0.2} r={lens.r * 0.18} fill="rgba(255,255,255,0.12)" />
              </g>
            ))}
          </svg>
        </div>

        {/* Top edge highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: `${borderRadiusPct}%`,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.05)",
          }}
        />
      </div>
    </div>
  )
}
