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
}

export default function FloatingCart({ product, region }: Props) {
  const { state, exportPrintFile, exportPreview, canvasRef, deviceConfig } = useCustomizer()
  const countryCode = useParams().countryCode as string
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement>(null)

  const [open, setOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("")
  const [error, setError] = useState("")

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

  const variant = product.variants?.[0]
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
      {/* ---- Desktop: FAB button + expandable panel (right side) ---- */}
      <div ref={panelRef} className="hidden lg:block fixed right-4 bottom-6 z-50" data-tour="floating-cart">
        {/* Expanded panel */}
        {open && (
          <div className="mb-3 w-[280px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-900">Add to Cart</span>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3">
              {/* Price + case type */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">{CASE_TYPE_LABEL[state.caseType]} Case</span>
                  <span className="text-[10px] text-gray-400">{deviceConfig.name}</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{priceStr ?? "—"}</span>
              </div>

              {/* Add to cart button */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding || !variant?.id}
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm
                  font-semibold transition-all ${
                    added
                      ? "bg-green-600 text-white"
                      : "bg-brand text-white hover:bg-brand-dark"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {isAdding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-xs">{uploadStatus || "Processing…"}</span>
                  </>
                ) : added ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </>
                )}
              </button>

              {error && (
                <p className="text-[11px] text-red-600 bg-red-50 rounded-lg px-2 py-1.5">{error}</p>
              )}

              {added && (
                <button
                  onClick={() => router.push(`/${countryCode}/cart`)}
                  className="text-xs text-center text-brand underline underline-offset-4 hover:text-brand-dark"
                >
                  View Cart →
                </button>
              )}
            </div>
          </div>
        )}

        {/* FAB button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
            open
              ? "bg-brand-dark text-white scale-90"
              : "bg-brand text-white hover:scale-105 hover:shadow-xl"
          }`}
          aria-label="Add to cart"
        >
          {added ? (
            <Check size={22} className="text-green-400" />
          ) : (
            <ShoppingCart size={22} />
          )}
          {priceStr && !open && (
            <span className="absolute -top-1 -left-1 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {priceStr}
            </span>
          )}
        </button>
      </div>

      {/* ---- Mobile: Full-width bottom bar — sits below content, not overlapping ---- */}
      <div className="lg:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.12)]" data-tour="floating-cart-mobile">
        <div className="px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {/* Compact: info + button in one row */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col min-w-0 shrink">
              <span className="text-[11px] text-gray-500 truncate">
                {CASE_TYPE_LABEL[state.caseType]} Case · {deviceConfig.name}
              </span>
              <span className="text-base font-bold text-gray-900 leading-tight">
                {priceStr ?? "—"}
              </span>
            </div>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding || !variant?.id}
              className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-xl text-sm
                font-bold transition-all whitespace-nowrap ${
                  added
                    ? "bg-green-600 text-white"
                    : "bg-brand text-white hover:bg-brand-dark active:scale-[0.98]"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isAdding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-xs">{uploadStatus || "Processing…"}</span>
                </>
              ) : added ? (
                <>
                  <Check className="w-4 h-4" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart — {priceStr || ""}
                </>
              )}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1.5 mt-1.5">{error}</p>
          )}

          {added && (
            <button
              onClick={() => router.push(`/${countryCode}/cart`)}
              className="w-full text-xs text-center text-brand underline underline-offset-4 hover:text-brand-dark mt-1.5 py-0.5"
            >
              View Cart →
            </button>
          )}
        </div>
      </div>
    </>
  )
}
