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
    "the person's hand is relaxed and stylish.",
  desk:
    "The case is lying flat on a clean minimal white desk next to a laptop " +
    "and a cup of coffee. Top-down product photography angle, soft even " +
    "studio lighting, shallow depth of field.",
  nature:
    "The case is resting on a moss-covered stone in a lush green forest. " +
    "Soft golden hour sunlight filtering through the trees, dewdrops " +
    "visible on nearby leaves, serene atmosphere.",
  studio:
    "The case is standing upright on a pure white studio background with " +
    "dramatic directional lighting from the upper left, creating a subtle " +
    "shadow and rim light on the edges. Clean, minimal, professional.",
  flat:
    "The case is photographed from a slight 3D perspective on a clean " +
    "white surface with subtle shadow and reflection underneath. " +
    "Professional product photography, even lighting.",
}

const CASE_TYPE_DESCRIPTIONS: Record<string, string> = {
  slim: "ultra-thin slim-fit case with minimal bezels and a sleek matte finish",
  tough: "rugged tough protective case with reinforced corners and a textured grip",
  clear: "transparent clear case with glossy finish that lets the design show through",
  magsafe: "MagSafe-compatible case with a visible magnetic ring on the back",
}

/**
 * Build the Gemini prompt that instructs the model to generate a
 * realistic phone case mockup using the provided design as reference.
 */
function buildPrompt(
  scene: string,
  caseType?: string,
  deviceModel?: string,
): string {
  const deviceLabel = deviceModel || "smartphone"
  const caseDesc = CASE_TYPE_DESCRIPTIONS[caseType || "tough"] || CASE_TYPE_DESCRIPTIONS.tough
  const sceneDesc = SCENE_DESCRIPTIONS[scene] || SCENE_DESCRIPTIONS.lifestyle

  return [
    `Generate a ultra-realistic, high-resolution product photograph of a ${deviceLabel} phone case.`,
    `The case is a ${caseDesc}.`,
    `CRITICAL: The design/artwork shown in the provided reference image must be faithfully and exactly reproduced on the back surface of the phone case.`,
    `Do NOT alter, crop, add to, or remove any element of the design. The design must wrap naturally around the case surface with realistic curvature and edge blending.`,
    `Scene: ${sceneDesc}`,
    `The photo must look like it was taken by a professional product photographer with a DSLR camera.`,
    `8K resolution, ultra sharp detail, realistic materials (plastic/silicone texture), proper light reflections on the case edges, photorealistic rendering.`,
    `Do NOT add any text, logos, watermarks, or branding that is not in the original design.`,
  ].join(" ")
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

    const prompt = buildPrompt(scene, caseType, deviceModel)

    console.log(
      "[ai-preview] Calling Gemini (Nano Banana) — scene:",
      scene,
      "case:",
      caseType,
      "device:",
      deviceModel || "unknown",
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
