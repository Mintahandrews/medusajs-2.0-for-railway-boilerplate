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

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const apiToken = process.env.REPLICATE_API_TOKEN
    if (!apiToken) {
      return res.status(503).json({
        error: "AI preview is not configured. Set REPLICATE_API_TOKEN in environment.",
      })
    }

    const { image, scene = "lifestyle" } = req.body as {
      image: string
      scene?: string
    }

    if (!image) {
      return res.status(400).json({ error: "Missing 'image' field (base64 PNG)." })
    }

    // Ensure data URL format for Replicate
    const dataUrl = image.startsWith("data:")
      ? image
      : `data:image/png;base64,${image}`

    const sceneConfig = SCENE_PROMPTS[scene] || SCENE_PROMPTS.lifestyle

    // Call Replicate — use SDXL img2img via the models endpoint (auto-latest version)
    // Prefer: wait blocks until prediction completes (up to 60s)
    const predictionRes = await fetch(
      "https://api.replicate.com/v1/models/stability-ai/sdxl/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
          Prefer: "wait=60",
        },
        body: JSON.stringify({
          input: {
            image: dataUrl,
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
