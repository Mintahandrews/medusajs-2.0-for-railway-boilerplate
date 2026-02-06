"use client"

import { useRef, useState, useCallback } from "react"
import { PhotoItem } from "../types"
import { X, ZoomIn, ZoomOut, Move, Check, ImagePlus } from "lucide-react"

type PhotoPanelProps = {
  photos: PhotoItem[]
  onUpload: (files: FileList) => void
  onDelete: (photoId: string) => void
  onUpdatePhoto: (photoId: string, updates: Partial<PhotoItem>) => void
  selectedSlotId: string | null
  onAssignToSlot: (photoId: string) => void
}

export default function PhotoPanel({
  photos,
  onUpload,
  onDelete,
  onUpdatePhoto,
  selectedSlotId,
  onAssignToSlot,
}: PhotoPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const handleDragStart = (e: React.DragEvent, photoId: string) => {
    e.dataTransfer.setData("photoId", photoId)
    e.dataTransfer.effectAllowed = "copy"
  }

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDraggingOver(false)
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onUpload(e.dataTransfer.files)
      }
    },
    [onUpload]
  )

  const editingPhoto = editingPhotoId ? photos.find((p) => p.id === editingPhotoId) : null

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleFileDrop}
        className={`relative border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group ${
          isDraggingOver
            ? "border-green-500 bg-green-50 scale-[1.02]"
            : "border-gray-300 hover:border-black hover:bg-gray-50"
        }`}
      >
        <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-2 transition-all ${
          isDraggingOver ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-black group-hover:text-white"
        }`}>
          <ImagePlus size={22} />
        </div>
        <span className="text-[13px] font-semibold text-gray-900">Upload Photos</span>
        <span className="text-[11px] text-gray-400 mt-0.5">Drop files or click to browse</span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onUpload(e.target.files)
              e.target.value = ""
            }
          }}
        />
      </div>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-[12px]">
          <p>No photos yet</p>
          <p className="text-[11px] mt-1">Upload photos to start designing</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {photos.map((photo) => {
            const isAssigned = !!photo.slotId
            const isEditing = editingPhotoId === photo.id
            return (
              <div
                key={photo.id}
                className={`relative aspect-square rounded-xl overflow-hidden group cursor-grab active:cursor-grabbing transition-all duration-200 ${
                  isEditing
                    ? "ring-2 ring-black ring-offset-1 scale-[1.03]"
                    : isAssigned
                    ? "ring-1 ring-green-400"
                    : "ring-1 ring-gray-200 hover:ring-gray-400"
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, photo.id)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                />

                {/* Assigned badge */}
                {isAssigned && (
                  <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                    <Check size={10} className="text-white" />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  {/* Assign to selected slot */}
                  {selectedSlotId && !isAssigned && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onAssignToSlot(photo.id) }}
                      className="h-7 px-2 rounded-lg bg-white text-[10px] font-bold text-black hover:bg-green-500 hover:text-white transition"
                    >
                      Add
                    </button>
                  )}
                  {/* Edit */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingPhotoId(isEditing ? null : photo.id)
                    }}
                    className="h-7 w-7 rounded-lg bg-white/90 text-black flex items-center justify-center hover:bg-white transition"
                  >
                    <Move size={12} />
                  </button>
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete(photo.id) }}
                    className="h-7 w-7 rounded-lg bg-white/90 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Zoom/Pan Editor for selected photo */}
      {editingPhoto && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Adjust Photo</span>
            <button
              type="button"
              onClick={() => setEditingPhotoId(null)}
              className="text-[10px] text-gray-500 hover:text-black font-medium"
            >
              Done
            </button>
          </div>

          {/* Zoom */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-500 font-medium">Zoom</span>
              <span className="text-[10px] text-gray-400 font-mono">{((editingPhoto.zoom || 1) * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUpdatePhoto(editingPhoto.id, { zoom: Math.max(0.5, (editingPhoto.zoom || 1) - 0.1) })}
                className="h-7 w-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition"
              >
                <ZoomOut size={12} />
              </button>
              <input
                type="range"
                min="50"
                max="300"
                value={(editingPhoto.zoom || 1) * 100}
                onChange={(e) => onUpdatePhoto(editingPhoto.id, { zoom: Number(e.target.value) / 100 })}
                className="flex-1 h-1 accent-black"
              />
              <button
                type="button"
                onClick={() => onUpdatePhoto(editingPhoto.id, { zoom: Math.min(3, (editingPhoto.zoom || 1) + 0.1) })}
                className="h-7 w-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition"
              >
                <ZoomIn size={12} />
              </button>
            </div>
          </div>

          {/* Pan X */}
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 font-medium">Horizontal Position</span>
            <input
              type="range"
              min="-100"
              max="100"
              value={editingPhoto.panX || 0}
              onChange={(e) => onUpdatePhoto(editingPhoto.id, { panX: Number(e.target.value) })}
              className="w-full h-1 accent-black"
            />
          </div>

          {/* Pan Y */}
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 font-medium">Vertical Position</span>
            <input
              type="range"
              min="-100"
              max="100"
              value={editingPhoto.panY || 0}
              onChange={(e) => onUpdatePhoto(editingPhoto.id, { panY: Number(e.target.value) })}
              className="w-full h-1 accent-black"
            />
          </div>

          {/* Reset */}
          <button
            type="button"
            onClick={() => onUpdatePhoto(editingPhoto.id, { zoom: 1, panX: 0, panY: 0, rotation: 0 })}
            className="w-full h-8 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-500 hover:text-black hover:border-gray-400 transition"
          >
            Reset Adjustments
          </button>
        </div>
      )}

      {photos.length > 0 && (
        <p className="text-[10px] text-gray-400 text-center">
          Drag photos into grid slots to place them
        </p>
      )}
    </div>
  )
}
