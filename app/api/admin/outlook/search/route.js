import { NextResponse } from "next/server";
import { searchEmails } from "@/lib/services/graph-service";

/**
 * GET /api/admin/outlook/search
 * E-posta arar
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const userId = searchParams.get("userId") || undefined;

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Search query is required" },
        { status: 400 }
      );
    }

    const emails = await searchEmails(query, userId);

    return NextResponse.json({
      success: true,
      emails,
    });
  } catch (error) {
    console.error("Error searching emails:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to search emails",
      },
      { status: 500 }
    );
  }
}
