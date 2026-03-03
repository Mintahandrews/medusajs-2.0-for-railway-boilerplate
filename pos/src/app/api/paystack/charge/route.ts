import { NextRequest, NextResponse } from "next/server"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ""
const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/admin/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.ok
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  // Auth: require a valid Medusa admin token
  const authHeader = req.headers.get("authorization")
  const token = authHeader?.replace(/^Bearer\s+/i, "") || ""
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  if (!PAYSTACK_SECRET_KEY) {
    return NextResponse.json(
      { message: "Paystack secret key not configured" },
      { status: 500 }
    )
  }

  try {
    const body = await req.json()

    // Whitelist allowed fields to prevent injection
    const sanitized: Record<string, unknown> = {
      email: body.email,
      amount: body.amount,
      currency: body.currency || "GHS",
      ...(body.reference ? { reference: body.reference } : {}),
      ...(body.mobile_money ? {
        mobile_money: {
          phone: String(body.mobile_money.phone || ""),
          provider: String(body.mobile_money.provider || ""),
        },
      } : {}),
      ...(body.metadata ? { metadata: body.metadata } : {}),
    }

    // Validate required fields
    if (!sanitized.email || !sanitized.amount) {
      return NextResponse.json(
        { message: "email and amount are required" },
        { status: 400 }
      )
    }

    const res = await fetch("https://api.paystack.co/charge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitized),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Paystack charge failed", data },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
