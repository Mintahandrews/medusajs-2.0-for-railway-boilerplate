"use client"

import React, { useRef } from "react"
import { Upload, ImagePlus } from "lucide-react"
import { useCustomizer } from "../../context"

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]
const MAX_SIZE_MB = 10

export default function UploadPanel() {
  const { addImage } = useCustomizer()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files) return
    Array.from(files).forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        alert(`Unsupported file type: ${file.type}`)
        return
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`File too large (max ${MAX_SIZE_MB}MB)`)
        return
      }
      addImage(file)
    })
    if (inputRef.current) inputRef.current.value = ""
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-sm font-semibold text-gray-700">Upload Image</h3>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed
                   border-gray-300 rounded-xl cursor-pointer hover:border-gray-500
                   hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
          <ImagePlus className="w-6 h-6 text-gray-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            Click or drag & drop
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PNG, JPG, WebP, SVG — max {MAX_SIZE_MB}MB
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg
                   bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        <Upload className="w-4 h-4" />
        Upload Photo
      </button>
    </div>
  )
}
