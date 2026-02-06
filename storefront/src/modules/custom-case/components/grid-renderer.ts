import { DeviceTemplate, GridLayout, PhotoItem } from "../types"

/**
 * Renders the custom case design to a canvas and returns the Data URL.
 * Supports grid gaps, zoom/pan per photo, and rounded corners.
 * Used for 3D texture generation and cart export.
 */
export async function renderGridToCanvas(
  device: DeviceTemplate,
  layout: GridLayout,
  photos: PhotoItem[],
  backgroundColor: string,
  gridGap = 0,
  multiplier = 1
): Promise<string> {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not get canvas context")

  canvas.width = device.width * multiplier
  canvas.height = device.height * multiplier
  ctx.scale(multiplier, multiplier)

  const w = device.width
  const h = device.height

  // Fill background
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, w, h)

  // Load all assigned images in parallel
  const assignedPhotos = photos.filter((p) => p.slotId)
  const loadResults = await Promise.allSettled(
    assignedPhotos.map(
      (photo) =>
        new Promise<{ photo: PhotoItem; img: HTMLImageElement }>((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => resolve({ photo, img })
          img.onerror = reject
          img.src = photo.url
        })
    )
  )

  const imgMap = new Map<string, HTMLImageElement>()
  for (const r of loadResults) {
    if (r.status === "fulfilled") imgMap.set(r.value.photo.id, r.value.img)
  }

  // Gap in device-pixel units
  const gap = gridGap * (w / 360)
  const halfGap = gap / 2
  const cornerRadius = gap > 0 ? Math.min(gap * 2, 12 * (w / 360)) : 0

  // Render each slot
  for (const slot of layout.slots) {
    const sx = (slot.x / 100) * w + halfGap
    const sy = (slot.y / 100) * h + halfGap
    const sw = (slot.width / 100) * w - gap
    const sh = (slot.height / 100) * h - gap

    if (sw <= 0 || sh <= 0) continue

    ctx.save()

    // Clip to slot with optional rounded corners
    ctx.beginPath()
    if (cornerRadius > 0) {
      roundedRect(ctx, sx, sy, sw, sh, cornerRadius)
    } else {
      ctx.rect(sx, sy, sw, sh)
    }
    ctx.clip()

    const photo = photos.find((p) => p.slotId === slot.id)
    if (photo && imgMap.has(photo.id)) {
      const img = imgMap.get(photo.id)!

      // "object-cover" fit
      const imgRatio = img.width / img.height
      const slotRatio = sw / sh

      let drawW: number, drawH: number, drawX: number, drawY: number

      if (imgRatio > slotRatio) {
        drawH = sh
        drawW = sh * imgRatio
        drawX = sx + (sw - drawW) / 2
        drawY = sy
      } else {
        drawW = sw
        drawH = sw / imgRatio
        drawX = sx
        drawY = sy + (sh - drawH) / 2
      }

      // Zoom & Pan
      const zoom = photo.zoom || 1
      const panX = (photo.panX || 0) * (w / 360)
      const panY = (photo.panY || 0) * (h / 360)

      const cx = drawX + drawW / 2
      const cy = drawY + drawH / 2
      const scaledW = drawW * zoom
      const scaledH = drawH * zoom
      const finalX = cx - scaledW / 2 + panX
      const finalY = cy - scaledH / 2 + panY

      // Rotation
      if (photo.rotation) {
        ctx.translate(cx + panX, cy + panY)
        ctx.rotate((photo.rotation * Math.PI) / 180)
        ctx.drawImage(img, -scaledW / 2, -scaledH / 2, scaledW, scaledH)
      } else {
        ctx.drawImage(img, finalX, finalY, scaledW, scaledH)
      }
    }

    ctx.restore()
  }

  return canvas.toDataURL("image/png")
}

/** Helper: draw a rounded rectangle path */
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  r = Math.min(r, w / 2, h / 2)
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
