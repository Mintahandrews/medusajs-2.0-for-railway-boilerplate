"use client"

import React, { useState, useRef, useEffect } from "react"
import { ShoppingCart, X, Check } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useCustomizer, type CaseType } from "../../context"
import { addCustomizedToCart, ensureCart } from "@lib/data/cart"
import { uploadDesignFiles } from "@lib/data/design-upload"
import { HttpTypes } from "@medusajs/types"

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
  mobileExpanded?: boolean
}

export default function FloatingCart({ product, region, mobileExpanded }: Props) {
  const { state, exportPrintFile, exportPreview, canvasRef, deviceConfig } = useCustomizer()
  const countryCode = useParams().countryCode as string
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement>(null)

  const [open, setOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("")
  const [error, setError] = useState("")
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    () => product.variants?.[0]?.id ?? ""
  )

  // Close panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const variant = product.variants?.find((v) => v.id === selectedVariantId) || product.variants?.[0]
  const cp = variant ? (variant as any).calculated_price : null
  const baseAmount = cp?.calculated_amount ?? cp?.amount ?? null
  const currencyCode = cp?.currency_code ?? region.currency_code
  const multiplier = CASE_TYPE_MULTIPLIER[state.caseType] ?? 1
  const adjustedPrice = baseAmount != null ? baseAmount * multiplier : null
  const priceStr = adjustedPrice != null
    ? new Intl.NumberFormat(undefined, { style: "currency", currency: currencyCode.toUpperCase() }).format(adjustedPrice)
    : null

  async function handleAddToCart() {
    if (!variant?.id || !canvasRef.current) return
    setIsAdding(true)
    setUploadStatus("")
    setError("")
    try {
      setUploadStatus("Preparing…")
      let cartId: string
      try {
        cartId = await ensureCart(countryCode)
      } catch (e: any) {
        throw new Error(`Could not create cart: ${e?.message || "Unknown error"}`)
      }

      setUploadStatus("Exporting design…")
      const previewDataUrl = exportPreview() || ""
      const printFileDataUrl = (await exportPrintFile(4)) || ""

      let previewUrl = ""
      let previewKey = ""
      let printFileUrl = ""
      let printFileKey = ""
      try {
        setUploadStatus("Uploading…")
        const uploaded = await uploadDesignFiles(previewDataUrl, printFileDataUrl, cartId)
        previewUrl = uploaded.previewUrl
        previewKey = uploaded.previewKey
        printFileUrl = uploaded.printFileUrl
        printFileKey = uploaded.printFileKey
      } catch {
        try { previewUrl = await downsizeToThumbnail(previewDataUrl, 300) } catch {}
      }

      setUploadStatus("Adding to cart…")
      await addCustomizedToCart({
        variantId: variant.id,
        quantity: 1,
        countryCode,
        metadata: {
          is_customized: "true",
          case_type: state.caseType,
          case_type_label: CASE_TYPE_LABEL[state.caseType],
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
        unit_price: adjustedPrice ?? undefined,
      })

      setAdded(true)
      setUploadStatus("")
      setTimeout(() => { setAdded(false); setOpen(false) }, 2500)
    } catch (err: any) {
      setError(err?.message || "Failed to add to cart")
      setUploadStatus("")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <>
      {/* ---- Desktop: show the same bottom Add‑to‑Cart bar (was a FAB) ---- */}

      {/* NOTE: kept the single bottom-bar implementation and surface it on all sizes so the Add-to-Cart is always visible */}

      <div 
        className={`sticky bottom-0 left-0 right-0 z-50 w-full bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] transition-all duration-300 ${mobileExpanded ? "opacity-0 translate-y-32 pointer-events-none lg:opacity-100 lg:translate-y-0 lg:pointer-events-auto" : "opacity-100 translate-y-0 pointer-events-auto"}`}
        data-tour="floating-cart-mobile"
      >
        <div className="p-3 sm:p-4">
          {/* Compact: info + button in one row */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex flex-col min-w-0 shrink">
              <div className="text-[11px] sm:text-[12px] text-gray-500 truncate mb-0.5">
                {product.variants && product.variants.length > 1 ? (
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="bg-transparent border-none text-gray-700 focus:ring-0 p-0 font-medium cursor-pointer max-w-[120px] sm:max-w-[160px]"
                  >
                    {product.variants.map((v) => (
                      <option key={v.id} value={v.id}>{v.title}</option>
                    ))}
                  </select>
                ) : (
                  <span>{CASE_TYPE_LABEL[state.caseType]} Case · {deviceConfig.name}</span>
                )}
              </div>
              <span className="text-base sm:text-lg font-bold text-gray-900 leading-none">
                {priceStr ?? "—"}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || !variant?.id}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-[13px] sm:text-sm
                  font-bold transition-all whitespace-nowrap ${
                    added
                      ? "bg-green-600 text-white"
                      : "bg-brand text-white hover:bg-brand-dark active:scale-[0.98]"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {isAdding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="hidden sm:inline">{uploadStatus || "Processing"}</span>
                  </>
                ) : added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              {/* Quick cart link */}
              <button
                onClick={() => router.push(`/${countryCode}/cart`)}
                className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-brand bg-brand-50 hover:bg-brand-100 transition-colors shrink-0"
                title="View Cart"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>

          {error && (
            <div className="absolute -top-12 left-0 right-0 mx-auto w-max max-w-[calc(100%-2rem)] bg-red-600 text-white text-xs px-4 py-2 rounded-full shadow-lg text-center opacity-90 backdrop-blur-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
