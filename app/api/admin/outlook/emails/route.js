import { NextResponse } from "next/server";
import { getEmails } from "@/lib/services/graph-service";

/**
 * GET /api/admin/outlook/emails
 * E-postaları listeler
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId") || "inbox";
    const top = parseInt(searchParams.get("top") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");
    const userId = searchParams.get("userId") || undefined;
    const filter = searchParams.get("filter") || undefined;
    const orderBy = searchParams.get("orderBy") || "receivedDateTime desc";
    const select = searchParams.get("select") || undefined;

    const result = await getEmails(folderId, { top, skip, userId, filter, orderBy, select });

    return NextResponse.json({
      success: true,
      emails: result.emails,
      nextLink: result.nextLink,
      count: result.count,
    });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch emails",
      },
      { status: 500 }
    );
  }
}
