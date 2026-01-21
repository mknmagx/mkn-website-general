import { NextResponse } from "next/server";
import { getMailFolders } from "@/lib/services/graph-service";

/**
 * GET /api/admin/outlook/folders
 * Mail klasörlerini listeler
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;
    const folders = await getMailFolders(userId);

    return NextResponse.json({
      success: true,
      folders,
    });
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch folders",
      },
      { status: 500 }
    );
  }
}
