"use client"

import { HttpTypes } from "@medusajs/types"
import { Container, clx } from "@medusajs/ui"
import Image from "next/image"
import { useState, useEffect } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<HttpTypes.StoreProductImage | null>(
    images?.[0] || null
  )

  useEffect(() => {
    if (images && images.length > 0) {
      setSelectedImage(images[0])
    }
  }, [images])

  if (!images || images.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col-reverse small:flex-row gap-6 h-full relative w-full">
      <div className="flex flex-row small:flex-col gap-4 overflow-x-auto small:overflow-y-auto w-full small:w-[90px] shrink-0 no-scrollbar">
        {images.map((image, index) => {
          const isSelected = selectedImage?.id === image.id
          return (
            <button
              key={image.id}
              className={clx(
                "relative aspect-square w-20 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                isSelected ? "border-black" : "border-transparent hover:border-gray-200"
              )}
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={image.url}
                alt={`Product thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          )
        })}
      </div>

      <div className="flex-1 relative aspect-[4/5] small:aspect-auto small:h-[600px] w-full bg-[#F5F5F7] rounded-[20px] overflow-hidden flex items-center justify-center p-8">
        {selectedImage && (
          <div className="relative w-full h-full">
            <Image
              src={selectedImage.url}
              priority
              className="object-contain"
              alt="Main product image"
              fill
              sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 600px"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageGallery
