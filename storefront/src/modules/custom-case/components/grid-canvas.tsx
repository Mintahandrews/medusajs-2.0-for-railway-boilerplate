"use client"

import { useState } from "react"
import { DeviceTemplate, GridLayout, PhotoItem } from "../types"
import { Plus, ImagePlus, X } from "lucide-react"
import PhoneCaseSVG from "./phone-case-svg"
import type { CaseMaterial } from "../case-viewer-types"

type GridCanvasProps = {
  device: DeviceTemplate
  layout: GridLayout
  photos: PhotoItem[]
  backgroundColor: string
  gridGap: number
  selectedSlotId: string | null
  caseColor?: string
  caseMaterial?: CaseMaterial
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
  caseColor = "#c0c0c0",
  caseMaterial = "glossy",
  onSlotClick,
  onDropPhoto,
  onRemoveFromSlot,
}: GridCanvasProps) {
  const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null)

  return (
    <div className="relative w-full flex items-center justify-center select-none">
      <PhoneCaseSVG
        device={device}
        caseColor={caseColor}
        caseMaterial={caseMaterial}
        className="w-full"
        style={{ maxWidth: 380 }}
        interactive
      >
        {/* Background color fill */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor }}
        />

        {/* Grid layout slots */}
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
                        transform: `scale(${photo.zoom || 1}) translate(${(photo.panX || 0) * 0.5}%, ${(photo.panY || 0) * 0.5}%) rotate(${photo.rotation || 0}deg)`,
                        transformOrigin: "center center",
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
      </PhoneCaseSVG>
    </div>
  )
}
