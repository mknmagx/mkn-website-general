import { NextResponse } from "next/server";
import { getEmailAttachments, downloadAttachment } from "@/lib/services/graph-service";

/**
 * GET /api/admin/outlook/emails/[id]/attachments
 * E-postanın eklerini listeler
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;
    const attachmentId = searchParams.get("attachmentId");

    // Belirli bir ek istendiyse
    if (attachmentId) {
      const attachment = await downloadAttachment(id, attachmentId, userId);
      return NextResponse.json({
        success: true,
        attachment,
      });
    }

    // Tüm ekleri listele
    const attachments = await getEmailAttachments(id, userId);

    return NextResponse.json({
      success: true,
      attachments,
    });
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch attachments",
      },
      { status: 500 }
    );
  }
}
