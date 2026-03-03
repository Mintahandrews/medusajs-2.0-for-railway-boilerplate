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

export async function GET(req: NextRequest) {
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

  const reference = req.nextUrl.searchParams.get("reference")
  if (!reference) {
    return NextResponse.json(
      { message: "Reference is required" },
      { status: 400 }
    )
  }

  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Verification failed", data },
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
