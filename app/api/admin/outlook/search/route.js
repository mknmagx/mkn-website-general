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
    const top = parseInt(searchParams.get("top") || "25", 10);
    const userId = searchParams.get("userId") || undefined;

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Search query is required" },
        { status: 400 }
      );
    }

    console.log(`[Outlook Search API] Searching for: "${query}" with top=${top}`);
    
    const emails = await searchEmails(query, userId, { top });

    console.log(`[Outlook Search API] Found ${emails.length} emails`);

    return NextResponse.json({
      success: true,
      emails,
      count: emails.length,
    });
  } catch (error) {
    console.error("Error searching emails:", error);
    console.error("Error details:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to search emails",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
