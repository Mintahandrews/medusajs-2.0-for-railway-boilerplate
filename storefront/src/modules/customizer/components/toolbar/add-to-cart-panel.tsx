"use client"

import React, { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ShoppingCart, Check } from "lucide-react"
import { useCustomizer, type CaseType } from "../../context"
import { addCustomizedToCart, ensureCart } from "@lib/data/cart"
import { uploadDesignFiles } from "@lib/data/design-upload"
import { HttpTypes } from "@medusajs/types"

/** Price multiplier per case type (relative to base variant price) */
const CASE_TYPE_MULTIPLIER: Record<CaseType, number> = {
  slim: 1.0,
  tough: 1.25,
  clear: 1.15,
  magsafe: 1.5,
}

const CASE_TYPE_LABEL: Record<CaseType, string> = {
  slim: "Slim",
  tough: "Tough",
  clear: "Clear",
  magsafe: "MagSafe",
}

/**
 * Downsize a data-URL image to a small thumbnail for metadata fallback.
 * Returns a base64 data URL that fits within Medusa's metadata size limits.
 */
function downsizeToThumbnail(dataUrl: string, maxDim: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      const ratio = Math.min(maxDim / width, maxDim / height, 1)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) return reject(new Error("No 2D context"))
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL("image/jpeg", 0.7))
    }
    img.onerror = () => reject(new Error("Image load failed"))
    img.src = dataUrl
  })
}

interface Props {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}

export default function AddToCartPanel({ product, region }: Props) {
  const { state, exportPrintFile, exportPreview, canvasRef, deviceConfig } = useCustomizer()
  const countryCode = useParams().countryCode as string
  const router = useRouter()

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    () => product.variants?.[0]?.id ?? ""
  )
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>("")
  const [error, setError] = useState<string>("")

  const selectedVariant = useMemo(
    () => product.variants?.find((v) => v.id === selectedVariantId),
    [product.variants, selectedVariantId]
  )

  const { baseAmount, price, currencyCode } = useMemo(() => {
    if (!selectedVariant) return { baseAmount: null, price: null, currencyCode: "" }
    const cp = (selectedVariant as any).calculated_price
    if (!cp) return { baseAmount: null, price: null, currencyCode: "" }
    const amount = cp.calculated_amount ?? cp.amount
    const currency = cp.currency_code ?? region.currency_code
    if (amount == null) return { baseAmount: null, price: null, currencyCode: currency }
    const multiplier = CASE_TYPE_MULTIPLIER[state.caseType] ?? 1
    const adjusted = amount * multiplier
    return {
      baseAmount: amount,
      price: new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency.toUpperCase(),
      }).format(adjusted),
      currencyCode: currency,
    }
  }, [selectedVariant, region.currency_code, state.caseType])

  async function handleAddToCart() {
    if (!selectedVariantId || !canvasRef.current) return

    setIsAdding(true)
    setUploadStatus("")
    setError("")
    try {
      // 1. Ensure cart exists
      setUploadStatus("Preparing…")
      let cartId: string
      try {
        cartId = await ensureCart(countryCode)
      } catch (e: any) {
        const detail = e?.message || "Unknown error"
        console.error("[Customizer] ensureCart failed:", detail)
        throw new Error(`Could not create cart: ${detail}. Please refresh and try again.`)
      }

      // 2. Export canvas data (skip canvas_json — too large for metadata)
      setUploadStatus("Exporting design…")
      const previewDataUrl = exportPreview() || ""
      const printFileDataUrl = (await exportPrintFile(4)) || ""

      // 3. Upload design files to cloud (optional — gracefully degrade)
      let previewUrl = ""
      let previewKey = ""
      let printFileUrl = ""
      let printFileKey = ""
      try {
        setUploadStatus("Uploading to cloud…")
        const uploaded = await uploadDesignFiles(previewDataUrl, printFileDataUrl, cartId)
        previewUrl = uploaded.previewUrl
        previewKey = uploaded.previewKey
        printFileUrl = uploaded.printFileUrl
        printFileKey = uploaded.printFileKey
      } catch (uploadErr) {
        console.warn("[Customizer] Cloud upload failed, storing thumbnail fallback:", uploadErr)
        // Fallback: store a small preview thumbnail as base64 in metadata
        // so the admin always has something to display
        try {
          previewUrl = await downsizeToThumbnail(previewDataUrl, 300)
        } catch {
          // Last resort — no preview at all
        }
      }

      // 4. Add to cart with flat metadata (no nested objects, no huge canvas_json)
      setUploadStatus("Adding to cart…")
      await addCustomizedToCart({
        variantId: selectedVariantId,
        quantity: 1,
        countryCode,
        metadata: {
          is_customized: "true",
          case_type: state.caseType,
          device_model: deviceConfig.name,
          device_handle: deviceConfig.handle,
          preview_image: previewUrl,
          preview_key: previewKey,
          print_file: printFileUrl,
          print_file_key: printFileKey,
          print_dpi: String(deviceConfig.printSpec.dpi),
          print_width_mm: String(deviceConfig.printSpec.widthMm),
          print_height_mm: String(deviceConfig.printSpec.heightMm),
          print_bleed_mm: String(deviceConfig.bleedMm),
        },
      })

      setAdded(true)
      setUploadStatus("")
      setTimeout(() => setAdded(false), 3000)
    } catch (err: any) {
      console.error("[Customizer] Failed to add to cart:", err)
      setError(err?.message || "Failed to add to cart. Please try again.")
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
        <div className="flex flex-col">
          <span className="text-sm text-gray-600">Price</span>
          <span className="text-[10px] text-gray-400">{CASE_TYPE_LABEL[state.caseType]} case</span>
        </div>
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

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

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
