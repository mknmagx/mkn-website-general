import { NextResponse } from "next/server";
import { replyToEmail } from "@/lib/services/graph-service";

/**
 * POST /api/admin/outlook/emails/[id]/reply
 * E-postaya cevap gönder
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;
    const { comment } = await request.json();

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment is required" },
        { status: 400 }
      );
    }

    await replyToEmail(id, comment, userId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error replying to email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to reply to email",
      },
      { status: 500 }
    );
  }
}
