import { NextResponse } from "next/server";
import { getEmailStats } from "@/lib/services/graph-service";

/**
 * GET /api/admin/outlook/stats
 * E-posta istatistiklerini getirir
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;
    const stats = await getEmailStats(userId);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch stats",
      },
      { status: 500 }
    );
  }
}
