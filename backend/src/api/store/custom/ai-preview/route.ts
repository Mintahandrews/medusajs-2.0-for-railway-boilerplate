import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * POST /store/custom/ai-preview
 *
 * Generates a realistic AI product photo of the user's phone case design
 * using Google Gemini 2.5 Flash Image (Nano Banana). The user's flat
 * canvas design is sent as a reference image, and Gemini generates a
 * photorealistic mockup of the case with that exact design printed on it.
 *
 * Body: {
 *   image:        string  — base64 PNG data URL of the case design
 *   scene:        string  — lifestyle | desk | nature | studio | flat
 *   case_type:    string  — slim | tough | clear | magsafe  (optional)
 *   device_model: string  — e.g. "iPhone 16 Pro Max"       (optional)
 *   device_handle:string  — e.g. "iphone-16-pro-max"       (optional)
 * }
 *
 * Returns: { imageUrl: string }   (base64 data URL of generated image)
 *
 * Requires GEMINI_API_KEY env var (Google AI Studio key).
 */

/* ---------- Scene prompt templates ---------- */

const SCENE_DESCRIPTIONS: Record<string, string> = {
  lifestyle:
    "The case is being held in a person's hand in a bright modern café. " +
    "Soft bokeh background, warm natural lighting from a nearby window, " +
    "the person's hand is relaxed and stylish. Show the back of the case facing the camera.",
  desk:
    "The case is lying face-down (back facing up) on a clean minimal white desk next to a laptop " +
    "and a cup of coffee. Top-down product photography angle, soft even " +
    "studio lighting, shallow depth of field.",
  nature:
    "The case is resting face-down (back facing up) on a moss-covered stone in a lush green forest. " +
    "Soft golden hour sunlight filtering through the trees, dewdrops " +
    "visible on nearby leaves, serene atmosphere.",
  studio:
    "The case is standing upright showing its back on a pure white studio background with " +
    "dramatic directional lighting from the upper left, creating a subtle " +
    "shadow and rim light on the edges. Clean, minimal, professional.",
  flat:
    "The case is photographed from a slight 3D perspective showing its back on a clean " +
    "white surface with subtle shadow and reflection underneath. " +
    "Professional product photography, even lighting.",
  transparent:
    "The case is floating in mid-air at a slight 3/4 angle showing its back. " +
    "The background is PURE SOLID BRIGHT GREEN (#00FF00) with absolutely NO gradients, " +
    "NO shadows on the background, NO reflections on the background, NO floor, NO surface. " +
    "ONLY the phone case exists — nothing else. The green must be perfectly uniform #00FF00 everywhere " +
    "behind the case. Light the case itself with soft even studio lighting so it looks realistic, " +
    "but cast NO shadows onto the green background.",
}

const CASE_TYPE_DESCRIPTIONS: Record<string, string> = {
  slim: "ultra-thin slim-fit snap-on case with minimal bezels and a sleek matte finish",
  tough: "rugged tough protective case with reinforced corners, raised bezels, and a textured grip",
  clear: "transparent clear case with glossy finish — the design is printed inside and visible through the clear plastic",
  magsafe: "MagSafe-compatible case with a visible circular magnetic ring on the back",
}

/* ---------- Device physical descriptions ---------- */

/**
 * Detailed physical descriptions of each device family so Gemini
 * generates the correct phone shape, aspect ratio, camera layout,
 * edge style, and proportions.
 */
const DEVICE_PHYSICAL: Record<string, string> = {
  // iPhone 16 / 16 Plus
  "iphone-16":
    "The phone has flat aluminum edges (like iPhone 12+), a 6.1-inch display, " +
    "and a VERTICAL PILL-SHAPED camera module in the upper-left corner of the back. " +
    "The camera pill contains 2 lenses stacked vertically with a flash on the right side. " +
    "Dimensions: 71.6 × 147.6 mm, slightly rounded corners.",
  "iphone-16-plus":
    "Same design as iPhone 16 but larger — 6.7-inch display, 77.8 × 160.9 mm. " +
    "VERTICAL PILL-SHAPED camera module in the upper-left with 2 stacked lenses and flash.",

  // iPhone 16 Pro / Pro Max
  "iphone-16-pro":
    "The phone has flat titanium edges with brushed texture, a 6.3-inch display, " +
    "and a LARGE SQUARE camera module in the upper-left corner with heavily rounded corners. " +
    "The square module contains 3 large lenses arranged in an L-shape: two on top, one bottom-left. " +
    "The flash and LiDAR sensor sit in the remaining bottom-right area. " +
    "Dimensions: 71.5 × 149.6 mm. The camera bump is prominent.",
  "iphone-16-pro-max":
    "Same design as iPhone 16 Pro but larger — 6.9-inch display, 77.6 × 163.0 mm. " +
    "LARGE SQUARE camera module with 3 lenses in L-shape arrangement. Titanium flat edges.",

  // iPhone 15 series
  "iphone-15":
    "Flat aluminum edges, 6.1-inch display, SQUARE camera module in upper-left with " +
    "2 lenses arranged DIAGONALLY (top-right, bottom-left) inside the square. Dimensions: 71.6 × 147.6 mm.",
  "iphone-15-plus":
    "Same as iPhone 15 but larger — 6.7-inch, 77.8 × 160.9 mm. Diagonal dual camera in square module.",
  "iphone-15-pro":
    "Flat titanium edges, 6.1-inch display, SQUARE camera module upper-left with 3 lenses in L-shape. " +
    "71.5 × 146.6 mm. Flash and LiDAR in the 4th corner of the module.",
  "iphone-15-pro-max":
    "Same as iPhone 15 Pro but larger — 6.7-inch, 76.7 × 159.9 mm. Triple L-shape camera. Titanium edges.",

  // iPhone 14 series
  "iphone-14":
    "Flat aluminum edges, SQUARE camera module in upper-left with 2 diagonal lenses. 71.5 × 146.7 mm.",
  "iphone-14-plus":
    "Same as iPhone 14 but 6.7-inch, 78.1 × 160.8 mm. Diagonal dual camera.",
  "iphone-14-pro":
    "Flat stainless steel edges, SQUARE camera module upper-left with 3 lenses in L-shape. " +
    "71.5 × 147.5 mm. Prominent camera bump with flash and LiDAR.",
  "iphone-14-pro-max":
    "Same as iPhone 14 Pro but 6.7-inch, 77.6 × 160.7 mm. Triple L-shape camera.",

  // iPhone 13 series
  "iphone-13":
    "Flat aluminum edges, SQUARE camera module in upper-left with 2 DIAGONAL lenses. 71.5 × 146.7 mm.",
  "iphone-13-mini":
    "Same as iPhone 13 but compact 5.4-inch — 64.2 × 131.5 mm. Diagonal dual camera.",
  "iphone-13-pro":
    "Flat stainless steel edges, SQUARE camera module upper-left with 3 lenses in triangle/L-shape. " +
    "71.5 × 146.7 mm.",
  "iphone-13-pro-max":
    "Same as iPhone 13 Pro but 6.7-inch, 78.1 × 160.8 mm.",

  // iPhone 12 series
  "iphone-12":
    "Flat aluminum edges (the model that introduced flat edges), SQUARE camera module upper-left, " +
    "2 diagonal lenses. 71.5 × 146.7 mm.",
  "iphone-12-mini":
    "Same flat-edge design, compact 5.4-inch — 64.2 × 131.5 mm. Diagonal dual camera.",
  "iphone-12-pro":
    "Flat stainless steel edges, SQUARE module upper-left, 3 lenses L-shape. 71.5 × 146.7 mm.",
  "iphone-12-pro-max":
    "Same as iPhone 12 Pro but larger — 78.1 × 160.8 mm.",

  // iPhone 11 series
  "iphone-11":
    "ROUNDED aluminum edges (pre-flat era), SQUARE camera module upper-left with 2 lenses " +
    "arranged DIAGONALLY. Thicker bezels. 75.7 × 150.9 mm. Noticeably rounder corners than iPhone 12+.",
  "iphone-11-pro":
    "ROUNDED stainless steel edges, SQUARE camera module upper-left with 3 lenses in " +
    "EQUILATERAL TRIANGLE arrangement (2 on top, 1 bottom-center). Matte glass back. " +
    "71.4 × 144.0 mm.",
  "iphone-11-pro-max":
    "Same as iPhone 11 Pro but larger — 77.8 × 158.0 mm. Rounded edges, triangle triple camera.",

  // iPhone SE
  "iphone-se-3":
    "Classic iPhone 8 body with ROUNDED aluminum edges, Touch ID home button (no Face ID), " +
    "SINGLE small camera lens in the upper-left. Very compact: 67.3 × 138.4 mm. " +
    "Thick top and bottom bezels.",

  // Samsung Galaxy S series
  "samsung-s23":
    "Flat-edge aluminum frame (like Galaxy S22+), 6.1-inch display. " +
    "THREE INDIVIDUAL camera circles vertically stacked on the upper-left, NO camera island/module housing. " +
    "Each lens is its own protruding circle. 70.9 × 146.3 mm. Rounded corners.",
  "samsung-s23-ultra":
    "Angular flat titanium frame with SHARP squared-off corners, 6.8-inch display. " +
    "FOUR INDIVIDUAL camera circles vertically stacked on the upper-left with graduated sizes " +
    "(largest at top, smallest at bottom). NO camera island housing. Built-in S Pen silo at bottom. " +
    "78.1 × 163.4 mm.",
  "samsung-s24":
    "Flat aluminum frame, 6.2-inch display. THREE INDIVIDUAL camera circles vertically stacked " +
    "on upper-left, no camera island. 70.6 × 147.0 mm.",
  "samsung-s24-ultra":
    "Flat titanium frame with SHARP squared corners, 6.8-inch. FOUR INDIVIDUAL graduated camera circles " +
    "vertically stacked upper-left. No module housing. S Pen. 79.0 × 162.3 mm.",
  "samsung-s25":
    "Flat aluminum frame with ROUNDED corners, 6.2-inch. THREE INDIVIDUAL camera circles " +
    "vertically stacked upper-left. 70.1 × 146.9 mm.",
  "samsung-s25-ultra":
    "Flat titanium frame with ROUNDED corners (unlike S24 Ultra's sharp corners), 6.9-inch. " +
    "FOUR INDIVIDUAL graduated camera circles vertically stacked upper-left. S Pen. 77.6 × 162.8 mm.",

  // Google Pixel
  "pixel-8":
    "Rounded aluminum frame with soft edges. Distinctive FULL-WIDTH HORIZONTAL CAMERA BAR " +
    "that spans edge-to-edge across the upper back. The bar contains 2 lenses and a flash " +
    "arranged horizontally. 6.2-inch, 70.8 × 150.5 mm.",
  "pixel-8-pro":
    "Same as Pixel 8 but larger (6.7-inch, 76.5 × 162.6 mm) with 3 lenses in the " +
    "edge-to-edge horizontal camera bar plus a temperature sensor.",
  "pixel-9":
    "Flat aluminum frame with softened corners. HORIZONTAL PILL-SHAPED camera island " +
    "that does NOT reach the edges — it floats in the upper-center of the back. " +
    "Contains 2 lenses horizontally. 6.3-inch, 72.0 × 152.8 mm.",
  "pixel-9-pro":
    "Same floating horizontal pill camera island as Pixel 9, but with 3 lenses. " +
    "72.0 × 152.8 mm.",
  "pixel-9-pro-xl":
    "Same design as Pixel 9 Pro but larger — 6.8-inch, 76.6 × 162.8 mm. " +
    "Floating horizontal pill camera island with 3 lenses.",

  // OnePlus
  "oneplus-12":
    "Curved glass back with aluminum frame. Large CIRCULAR camera module CENTERED at the top " +
    "of the back (not left-aligned). Contains 3 lenses in triangle arrangement inside the circle. " +
    "Hasselblad branding. 75.8 × 164.3 mm.",
  "oneplus-12r":
    "Similar to OnePlus 12 but CIRCULAR camera module centered at top with 2 lenses vertically stacked. " +
    "75.3 × 163.3 mm.",

  // Xiaomi
  "xiaomi-14":
    "Flat aluminum frame, compact 6.36-inch display. SQUARE camera module CENTERED at the top " +
    "of the back with rounded corners. Contains 3 Leica lenses (2 top, 1 bottom). " +
    "71.5 × 152.8 mm.",
  "xiaomi-14-pro":
    "Curved edges, 6.73-inch display. LARGER SQUARE camera module CENTERED at the top " +
    "with 3 Leica lenses and prominent Leica branding. 75.3 × 161.4 mm.",

  // Nothing Phone
  "nothing-phone-2a":
    "Flat frame with transparent-styled back. SQUARE camera module CENTERED at the top " +
    "with 2 lenses and Nothing's distinctive LED Glyph light strips visible on the back. " +
    "76.3 × 161.7 mm.",
  "nothing-phone-2a-plus":
    "Same as Nothing Phone 2a — centered square dual camera with LED Glyph strips. " +
    "76.3 × 161.7 mm.",
}

/**
 * Get device physical description. Falls back to family-level matching
 * if exact handle isn't found.
 */
function getDeviceDescription(handle?: string): string {
  if (!handle) return ""
  // Exact match
  if (DEVICE_PHYSICAL[handle]) return DEVICE_PHYSICAL[handle]
  // Family fallback
  if (/^iphone-16-pro/.test(handle)) return DEVICE_PHYSICAL["iphone-16-pro"] || ""
  if (/^iphone-16/.test(handle)) return DEVICE_PHYSICAL["iphone-16"] || ""
  if (/^iphone-15-pro/.test(handle)) return DEVICE_PHYSICAL["iphone-15-pro"] || ""
  if (/^iphone-15/.test(handle)) return DEVICE_PHYSICAL["iphone-15"] || ""
  if (/^iphone-14-pro/.test(handle)) return DEVICE_PHYSICAL["iphone-14-pro"] || ""
  if (/^iphone-14/.test(handle)) return DEVICE_PHYSICAL["iphone-14"] || ""
  if (/^iphone-13-pro/.test(handle)) return DEVICE_PHYSICAL["iphone-13-pro"] || ""
  if (/^iphone-13/.test(handle)) return DEVICE_PHYSICAL["iphone-13"] || ""
  if (/^iphone-12-pro/.test(handle)) return DEVICE_PHYSICAL["iphone-12-pro"] || ""
  if (/^iphone-12/.test(handle)) return DEVICE_PHYSICAL["iphone-12"] || ""
  if (/^iphone-11-pro/.test(handle)) return DEVICE_PHYSICAL["iphone-11-pro"] || ""
  if (/^iphone-11/.test(handle)) return DEVICE_PHYSICAL["iphone-11"] || ""
  if (/^iphone-se/.test(handle)) return DEVICE_PHYSICAL["iphone-se-3"] || ""
  if (/samsung.*ultra/.test(handle)) return DEVICE_PHYSICAL["samsung-s25-ultra"] || ""
  if (/samsung/.test(handle)) return DEVICE_PHYSICAL["samsung-s25"] || ""
  if (/^pixel-9-pro/.test(handle)) return DEVICE_PHYSICAL["pixel-9-pro"] || ""
  if (/^pixel-9/.test(handle)) return DEVICE_PHYSICAL["pixel-9"] || ""
  if (/^pixel-8-pro/.test(handle)) return DEVICE_PHYSICAL["pixel-8-pro"] || ""
  if (/^pixel-8/.test(handle)) return DEVICE_PHYSICAL["pixel-8"] || ""
  if (/^oneplus-12r/.test(handle)) return DEVICE_PHYSICAL["oneplus-12r"] || ""
  if (/^oneplus-12/.test(handle)) return DEVICE_PHYSICAL["oneplus-12"] || ""
  if (/xiaomi-14-pro/.test(handle)) return DEVICE_PHYSICAL["xiaomi-14-pro"] || ""
  if (/xiaomi-14/.test(handle)) return DEVICE_PHYSICAL["xiaomi-14"] || ""
  if (/nothing/.test(handle)) return DEVICE_PHYSICAL["nothing-phone-2a"] || ""
  return ""
}

/**
 * Build the Gemini prompt that instructs the model to generate a
 * realistic phone case mockup using the provided design as reference.
 */
function buildPrompt(
  scene: string,
  caseType?: string,
  deviceModel?: string,
  deviceHandle?: string,
): string {
  const deviceLabel = deviceModel || "smartphone"
  const caseDesc = CASE_TYPE_DESCRIPTIONS[caseType || "tough"] || CASE_TYPE_DESCRIPTIONS.tough
  const sceneDesc = SCENE_DESCRIPTIONS[scene] || SCENE_DESCRIPTIONS.lifestyle
  const deviceDesc = getDeviceDescription(deviceHandle)

  const lines: string[] = [
    `Generate an ultra-realistic, high-resolution product photograph showing the BACK of a ${deviceLabel} phone case.`,
    `The case is a ${caseDesc}.`,
  ]

  if (deviceDesc) {
    lines.push(
      `DEVICE SHAPE — This is critical for accuracy: ${deviceDesc}`,
      `The generated phone case MUST match this exact device shape, proportions, camera cutout position, and aspect ratio.`,
      `The camera cutout in the case must be in the EXACT position described above — do not move it or change its shape.`,
    )
  }

  lines.push(
    `DESIGN — The provided reference image shows a flat export of the custom design that is printed on the back of the case.`,
    `CRITICAL: Reproduce this design EXACTLY as shown — same colors, same layout, same elements, same proportions.`,
    `The design must cover the entire back surface of the case. Do NOT crop, stretch, shrink, or alter any part of the design.`,
    `The design should wrap naturally around the case surface with realistic curvature and subtle edge blending where the case curves around the phone edges.`,
    `SCENE: ${sceneDesc}`,
    `PHOTOGRAPHY STYLE: The image must look like a real product photograph taken by a professional photographer with a DSLR camera.`,
    `Ultra sharp detail, realistic plastic/silicone/TPU material texture, proper specular highlights and light reflections on the case edges, photorealistic shadows.`,
    `Do NOT add any text, logos, watermarks, or branding that is not in the original design.`,
    `Do NOT show the front screen of the phone — only the back of the case should be visible.`,
  )

  return lines.join("\n")
}

/**
 * Strip the data-URL prefix and return raw base64 + mime type.
 */
function parseDataUrl(dataUrl: string): { base64: string; mimeType: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (match) {
    return { mimeType: match[1], base64: match[2] }
  }
  // Assume raw base64 PNG if no prefix
  return { mimeType: "image/png", base64: dataUrl }
}

/* ---------- Gemini API types ---------- */

interface GeminiPart {
  text?: string
  inlineData?: { mimeType: string; data: string }
  inline_data?: { mime_type: string; data: string }
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[]
    }
    finishReason?: string
  }>
  error?: { message: string; code: number }
  promptFeedback?: { blockReason?: string }
}

/* ---------- Route handler ---------- */

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Diagnostic logging
    console.log("[ai-preview] Request received — content-type:", req.headers["content-type"],
      "content-length:", req.headers["content-length"],
      "body type:", typeof req.body,
      "body keys:", req.body && typeof req.body === "object" ? Object.keys(req.body) : "N/A")

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(503).json({
        error: "AI preview is not configured. Set GEMINI_API_KEY in environment.",
      })
    }

    // Parse request body — defensive: handle cases where body parser may not
    // have run (e.g. middleware mismatch) by reading raw stream as fallback.
    let body = req.body as Record<string, unknown> | undefined
    if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
      // Attempt manual parse as fallback
      try {
        const chunks: Buffer[] = []
        for await (const chunk of req as any) chunks.push(Buffer.from(chunk))
        if (chunks.length > 0) {
          body = JSON.parse(Buffer.concat(chunks).toString("utf-8"))
        }
      } catch (parseErr) {
        console.error("[ai-preview] Fallback body parse failed:", parseErr)
      }
    }
    if (!body || typeof body !== "object") {
      console.error("[ai-preview] req.body is empty or not an object:", typeof body)
      return res.status(400).json({
        error: "Request body is empty. Ensure Content-Type is application/json.",
      })
    }

    const image = body.image as string | undefined
    const scene = (body.scene as string) || "lifestyle"
    const caseType = (body.case_type as string) || "tough"
    const deviceModel = body.device_model as string | undefined
    const deviceHandle = body.device_handle as string | undefined

    if (!image || typeof image !== "string" || image.length < 100) {
      console.error(
        "[ai-preview] Missing or invalid 'image' field. Body keys:",
        Object.keys(body),
        "image length:",
        image ? image.length : 0
      )
      return res.status(400).json({ error: "Missing 'image' field (base64 PNG)." })
    }

    // Ensure data URL format then extract raw base64
    const dataUrl = image.startsWith("data:")
      ? image
      : `data:image/png;base64,${image}`
    const { base64, mimeType } = parseDataUrl(dataUrl)

    const prompt = buildPrompt(scene, caseType, deviceModel, deviceHandle)

    console.log(
      "[ai-preview] Calling Gemini (Nano Banana) — scene:",
      scene,
      "case:",
      caseType,
      "device:",
      deviceModel || "unknown",
      "handle:",
      deviceHandle || "unknown",
      "image size:",
      Math.round(base64.length / 1024),
      "KB"
    )

    // Call Google Gemini 2.5 Flash Image (Nano Banana) REST API
    const geminiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
        },
      }),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error("[ai-preview] Gemini API error:", geminiRes.status, errText.slice(0, 500))
      return res.status(502).json({
        error: `AI preview generation failed (${geminiRes.status}).`,
        detail: errText.slice(0, 300),
      })
    }

    const geminiData = (await geminiRes.json()) as GeminiResponse

    // Check for API-level errors
    if (geminiData.error) {
      console.error("[ai-preview] Gemini error:", geminiData.error)
      return res.status(502).json({
        error: geminiData.error.message || "AI preview generation failed.",
      })
    }

    // Check for safety blocks
    if (geminiData.promptFeedback?.blockReason) {
      console.warn("[ai-preview] Prompt blocked:", geminiData.promptFeedback.blockReason)
      return res.status(422).json({
        error: `Content blocked by safety filter: ${geminiData.promptFeedback.blockReason}`,
      })
    }

    // Extract the generated image from the response
    const parts = geminiData.candidates?.[0]?.content?.parts
    if (!parts || parts.length === 0) {
      console.error("[ai-preview] No parts in Gemini response:", JSON.stringify(geminiData).slice(0, 500))
      return res.status(502).json({ error: "AI returned no image. Try a different scene." })
    }

    // Find the image part (could be inlineData or inline_data depending on API version)
    let imageBase64: string | null = null
    let imageMime: string = "image/png"

    for (const part of parts) {
      if (part.inlineData?.data) {
        imageBase64 = part.inlineData.data
        imageMime = part.inlineData.mimeType || "image/png"
        break
      }
      if (part.inline_data?.data) {
        imageBase64 = part.inline_data.data
        imageMime = part.inline_data.mime_type || "image/png"
        break
      }
    }

    if (!imageBase64) {
      // Log any text parts for debugging
      const textParts = parts.filter((p) => p.text).map((p) => p.text)
      console.error("[ai-preview] No image in response. Text parts:", textParts)
      return res.status(502).json({
        error: "AI did not generate an image. Try again or use a different scene.",
      })
    }

    // Return as a data URL
    const resultUrl = `data:${imageMime};base64,${imageBase64}`

    console.log(
      "[ai-preview] Success — generated image:",
      Math.round(imageBase64.length / 1024),
      "KB"
    )

    return res.status(200).json({ imageUrl: resultUrl })
  } catch (err: any) {
    console.error("[ai-preview] Error:", err)
    return res.status(500).json({ error: err.message || "Internal server error" })
  }
}
