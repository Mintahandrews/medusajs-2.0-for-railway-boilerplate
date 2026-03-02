import { NextRequest, NextResponse } from "next/server"
import { sendSMS } from "@lib/sms"

/**
 * POST /api/sms/send
 * Send an SMS message via SMSOnlineGH.
 *
 * Body: { destinations: string[], text: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { destinations, text } = body

    if (
      !destinations ||
      !Array.isArray(destinations) ||
      destinations.length === 0
    ) {
      return NextResponse.json(
        { error: "destinations must be a non-empty array of phone numbers" },
        { status: 400 }
      )
    }

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "text must be a non-empty string" },
        { status: 400 }
      )
    }

    const result = await sendSMS(destinations, text.trim())

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send SMS" },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      batch: result.batch,
      destinations: result.destinations,
    })
  } catch (err: any) {
    console.error("[api/sms/send]", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
