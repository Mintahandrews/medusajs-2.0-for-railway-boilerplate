"use client"

import React, { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ShoppingCart, Check, Upload, Loader2 } from "lucide-react"
import { useCustomizer } from "../../context"
import { addCustomizedToCart, ensureCart } from "@lib/data/cart"
import { uploadDesignFiles } from "@lib/data/design-upload"
import { HttpTypes } from "@medusajs/types"

interface Props {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}

export default function AddToCartPanel({ product, region }: Props) {
  const { exportPrintFile, exportPreview, canvasRef, deviceConfig } = useCustomizer()
  const countryCode = useParams().countryCode as string
  const router = useRouter()

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    () => product.variants?.[0]?.id ?? ""
  )
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>("")

  const selectedVariant = useMemo(
    () => product.variants?.find((v) => v.id === selectedVariantId),
    [product.variants, selectedVariantId]
  )

  const price = useMemo(() => {
    if (!selectedVariant) return null
    const cp = (selectedVariant as any).calculated_price
    if (!cp) return null
    const amount = cp.calculated_amount ?? cp.amount
    const currency = cp.currency_code ?? region.currency_code
    if (amount == null) return null
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount)
  }, [selectedVariant, region.currency_code])

  async function handleAddToCart() {
    if (!selectedVariantId || !canvasRef.current) return

    setIsAdding(true)
    setUploadStatus("")
    try {
      // 1. Ensure cart exists and get its ID (needed for upload auth)
      setUploadStatus("Preparing…")
      const cartId = await ensureCart(countryCode)

      // 2. Export canvas data
      setUploadStatus("Exporting design…")
      const canvasJSON = JSON.stringify(canvasRef.current.toJSON())
      const previewDataUrl = exportPreview() || ""
      const printFileDataUrl = (await exportPrintFile(4)) || ""

      // 3. Upload design files to MinIO
      setUploadStatus("Uploading to cloud…")
      const uploaded = await uploadDesignFiles(previewDataUrl, printFileDataUrl, cartId)

      // 4. Add to cart with MinIO URLs + print specs
      setUploadStatus("Adding to cart…")
      await addCustomizedToCart({
        variantId: selectedVariantId,
        quantity: 1,
        countryCode,
        metadata: {
          is_customized: true,
          device_model: deviceConfig.name,
          canvas_json: canvasJSON,
          preview_image: uploaded.previewUrl,
          preview_key: uploaded.previewKey,
          print_file: uploaded.printFileUrl,
          print_file_key: uploaded.printFileKey,
          specs: {
            dpi: deviceConfig.printSpec.dpi,
            width_mm: deviceConfig.printSpec.widthMm,
            height_mm: deviceConfig.printSpec.heightMm,
            bleed_mm: deviceConfig.bleedMm,
          },
        },
      })

      setAdded(true)
      setUploadStatus("")
      setTimeout(() => setAdded(false), 3000)
    } catch (err) {
      console.error("[Customizer] Failed to add to cart:", err)
      alert("Failed to add to cart. Please try again.")
      setUploadStatus("")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-sm font-semibold text-gray-700">Add to Cart</h3>

      {/* Variant selector (if multiple variants) */}
      {product.variants && product.variants.length > 1 && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">Model</label>
          <select
            value={selectedVariantId}
            onChange={(e) => setSelectedVariantId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            {product.variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title || v.id}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Price display */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
        <span className="text-sm text-gray-600">Price</span>
        <span className="text-lg font-bold text-gray-900">
          {price ?? "—"}
        </span>
      </div>

      {/* Product info */}
      <div className="text-xs text-gray-400">
        <p>{product.title}</p>
        {selectedVariant && (
          <p className="mt-0.5">
            Variant: {selectedVariant.title}
          </p>
        )}
      </div>

      {/* Add to cart button */}
      <button
        onClick={handleAddToCart}
        disabled={isAdding || !selectedVariantId}
        className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm
                    font-semibold transition-all ${
                      added
                        ? "bg-green-600 text-white"
                        : "bg-black text-white hover:bg-gray-800"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {isAdding ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {uploadStatus || "Processing…"}
          </>
        ) : added ? (
          <>
            <Check className="w-4 h-4" />
            Added to Cart!
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </>
        )}
      </button>

      {/* View cart link */}
      {added && (
        <button
          onClick={() => router.push(`/${countryCode}/cart`)}
          className="text-sm text-center text-black underline underline-offset-4
                     hover:text-gray-600 transition-colors"
        >
          View Cart →
        </button>
      )}
    </div>
  )
}
