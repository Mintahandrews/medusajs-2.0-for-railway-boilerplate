import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * POST /store/custom/ai-preview
 *
 * Generates a realistic AI product photo of the user's phone case design
 * using Replicate (SDXL img2img). The flat canvas export is transformed
 * into a lifestyle product shot while preserving the design.
 *
 * Body: {
 *   image: string  — base64 PNG data URL of the case preview
 *   scene: string  — one of: lifestyle | desk | nature | studio | flat
 * }
 *
 * Returns: { imageUrl: string }
 *
 * Requires REPLICATE_API_TOKEN env var.
 */

const SCENE_PROMPTS: Record<string, { prompt: string; strength: number }> = {
  lifestyle: {
    prompt:
      "A realistic photo of a custom phone case held in a person's hand, bright modern café background, soft bokeh, product photography, natural lighting, 8k, ultra detailed",
    strength: 0.55,
  },
  desk: {
    prompt:
      "A realistic photo of a custom phone case lying on a clean minimal white desk next to a laptop and coffee cup, top-down product photography, soft studio lighting, 8k",
    strength: 0.55,
  },
  nature: {
    prompt:
      "A realistic photo of a custom phone case resting on a moss-covered stone in a lush forest, soft golden hour light filtering through trees, product photography, 8k",
    strength: 0.55,
  },
  studio: {
    prompt:
      "A realistic photo of a custom phone case floating on a pure white studio background, dramatic directional lighting, subtle shadow, professional product photography, 8k",
    strength: 0.45,
  },
  flat: {
    prompt:
      "A realistic high-quality product photo of a custom phone case, slight 3D perspective, subtle shadow and reflection, clean white background, professional product photography, 8k",
    strength: 0.35,
  },
}

const NEGATIVE_PROMPT =
  "blurry, low quality, distorted, deformed, ugly, text, watermark, logo, oversaturated, cartoon, illustration, painting, sketch, drawing"

/**
 * Upload a base64 data-URL image to Replicate's file API and return a
 * short-lived serving URL that can be used as model input.
 * Falls back to the raw data URL if the upload fails.
 */
async function uploadToReplicate(
  dataUrl: string,
  apiToken: string
): Promise<string> {
  try {
    // Strip the data-URL prefix to get raw base64
    const base64Match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (!base64Match) return dataUrl

    const mimeType = base64Match[1]
    const base64Data = base64Match[2]
    const buffer = Buffer.from(base64Data, "base64")

    const uploadRes = await fetch("https://api.replicate.com/v1/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": mimeType,
      },
      body: buffer,
    })

    if (uploadRes.ok) {
      const file = (await uploadRes.json()) as { urls?: { get: string } }
      if (file.urls?.get) {
        console.log("[ai-preview] Uploaded image to Replicate file API")
        return file.urls.get
      }
    }

    console.warn("[ai-preview] File upload failed, falling back to data URL")
    return dataUrl
  } catch (err) {
    console.warn("[ai-preview] File upload error, falling back to data URL:", err)
    return dataUrl
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const apiToken = process.env.REPLICATE_API_TOKEN
    if (!apiToken) {
      return res.status(503).json({
        error: "AI preview is not configured. Set REPLICATE_API_TOKEN in environment.",
      })
    }

    // Defensive: log body shape for debugging
    const body = req.body as Record<string, unknown> | undefined
    if (!body || typeof body !== "object") {
      console.error("[ai-preview] req.body is empty or not an object:", typeof body)
      return res.status(400).json({
        error: "Request body is empty. Ensure Content-Type is application/json.",
      })
    }

    const image = body.image as string | undefined
    const scene = (body.scene as string) || "lifestyle"

    if (!image || typeof image !== "string" || image.length < 100) {
      console.error(
        "[ai-preview] Missing or invalid 'image' field. Body keys:",
        Object.keys(body),
        "image length:",
        image ? image.length : 0
      )
      return res.status(400).json({ error: "Missing 'image' field (base64 PNG)." })
    }

    // Ensure data URL format
    const dataUrl = image.startsWith("data:")
      ? image
      : `data:image/png;base64,${image}`

    // Upload image to Replicate's file API for reliable delivery
    // (avoids large base64 strings in JSON prediction input)
    const imageInput = await uploadToReplicate(dataUrl, apiToken)

    const sceneConfig = SCENE_PROMPTS[scene] || SCENE_PROMPTS.lifestyle

    console.log(
      "[ai-preview] Creating prediction — scene:",
      scene,
      "image input type:",
      imageInput.startsWith("http") ? "url" : "data-url",
      "image size:",
      image.length
    )

    // Call Replicate — use SDXL img2img via the predictions endpoint
    // Pin to a known version that supports img2img via the `image` input
    const predictionRes = await fetch(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
          Prefer: "wait=60",
        },
        body: JSON.stringify({
          version:
            "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
          input: {
            image: imageInput,
            prompt: sceneConfig.prompt,
            negative_prompt: NEGATIVE_PROMPT,
            prompt_strength: sceneConfig.strength,
            num_outputs: 1,
            width: 1024,
            height: 1024,
            num_inference_steps: 30,
            guidance_scale: 7.5,
            scheduler: "K_EULER",
          },
        }),
      }
    )

    if (!predictionRes.ok) {
      const errText = await predictionRes.text()
      console.error("[ai-preview] Replicate API error:", predictionRes.status, errText)
      return res.status(502).json({
        error: `AI preview generation failed (${predictionRes.status}).`,
        detail: errText.slice(0, 300),
      })
    }

    const prediction = (await predictionRes.json()) as {
      id: string
      status: string
      output?: string[]
      error?: string
      urls?: { get: string }
    }

    // If "Prefer: wait" returned a completed prediction
    if (prediction.status === "succeeded" && prediction.output?.length) {
      return res.status(200).json({ imageUrl: prediction.output[0] })
    }

    // If still processing, poll until done (fallback for slow generations)
    if (prediction.status === "starting" || prediction.status === "processing") {
      const getUrl = prediction.urls?.get
      if (!getUrl) {
        return res.status(502).json({ error: "No polling URL returned from Replicate." })
      }

      const maxWait = 90_000 // 90 seconds max
      const start = Date.now()
      let result = prediction

      while (
        (result.status === "starting" || result.status === "processing") &&
        Date.now() - start < maxWait
      ) {
        await new Promise((r) => setTimeout(r, 2000))
        const pollRes = await fetch(getUrl, {
          headers: { Authorization: `Bearer ${apiToken}` },
        })
        result = await pollRes.json()
      }

      if (result.status === "succeeded" && result.output?.length) {
        return res.status(200).json({ imageUrl: result.output[0] })
      }

      if (result.status === "failed") {
        console.error("[ai-preview] Replicate prediction failed:", result.error)
        return res.status(502).json({
          error: result.error || "AI preview generation failed.",
        })
      }

      return res.status(504).json({ error: "AI preview timed out. Please try again." })
    }

    // Prediction failed immediately
    if (prediction.status === "failed") {
      console.error("[ai-preview] Replicate prediction failed:", prediction.error)
      return res.status(502).json({
        error: prediction.error || "AI preview generation failed.",
      })
    }

    return res.status(502).json({ error: "Unexpected prediction status: " + prediction.status })
  } catch (err: any) {
    console.error("[ai-preview] Error:", err)
    return res.status(500).json({ error: err.message || "Internal server error" })
  }
}
