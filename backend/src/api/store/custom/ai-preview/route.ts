import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * POST /store/custom/ai-preview
 *
 * Proxies a request to the Pebblely AI API to generate a lifestyle
 * product photo from the user's custom case design.
 *
 * Body: {
 *   image: string (base64 PNG — the case preview export)
 *   description?: string (custom scene prompt)
 *   theme?: string (Pebblely theme name)
 * }
 *
 * Returns: { data: string (base64 result image), credits: number }
 *
 * Requires PEBBLELY_API_KEY env var to be set.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const apiKey = process.env.PEBBLELY_API_KEY
    if (!apiKey) {
      return res.status(503).json({
        error: "AI preview is not configured. Set PEBBLELY_API_KEY in environment.",
      })
    }

    const {
      image,
      description,
      theme,
    } = req.body as {
      image: string
      description?: string
      theme?: string
    }

    if (!image) {
      return res.status(400).json({ error: "Missing 'image' field (base64 PNG)." })
    }

    // Strip data URL prefix if present
    const base64Image = image.replace(/^data:image\/\w+;base64,/, "")

    // Build Pebblely API request
    const pebblelyBody: Record<string, any> = {
      images: [base64Image],
      description:
        description ||
        "A custom phone case with this design, held in a person's hand in a bright modern lifestyle setting, product photography",
      height: 1024,
      width: 1024,
      autoresize: true,
    }

    // Use theme only if no description
    if (!description && theme) {
      delete pebblelyBody.description
      pebblelyBody.theme = theme
    }

    const response = await fetch(
      "https://api.pebblely.com/create-background/v2/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Pebblely-Access-Token": apiKey,
        },
        body: JSON.stringify(pebblelyBody),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error("[ai-preview] Pebblely API error:", response.status, errText)
      return res.status(502).json({
        error: `AI preview generation failed (${response.status}).`,
      })
    }

    const result = (await response.json()) as { data: string; credits: number }

    return res.status(200).json({
      data: result.data,
      credits: result.credits,
    })
  } catch (err: any) {
    console.error("[ai-preview] Error:", err)
    return res.status(500).json({ error: err.message || "Internal server error" })
  }
}
