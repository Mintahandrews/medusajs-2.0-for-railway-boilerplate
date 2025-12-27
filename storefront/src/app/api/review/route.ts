import { NextRequest, NextResponse } from "next/server";

// Review API - Returns empty reviews since Medusa doesn't have built-in reviews
// TODO: Integrate with a review service (Judge.me, Yotpo, etc.) or use Medusa metadata

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productSlug } = body;

  try {
    // Placeholder: Return empty reviews
    // In a real implementation, you would fetch from a review service
    const reviews: any[] = [];

    return NextResponse.json({
      review: reviews,
      avgRating: 0,
      totalRating: 0,
    }, { status: 200 });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
