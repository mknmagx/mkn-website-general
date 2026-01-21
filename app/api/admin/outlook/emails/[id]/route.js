import { NextResponse } from "next/server";
import {
  getEmailById,
  deleteEmail,
} from "@/lib/services/graph-service";

/**
 * GET /api/admin/outlook/emails/[id]
 * Tek bir e-postanın detaylarını getirir
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;
    const email = await getEmailById(id, userId);

    return NextResponse.json({
      success: true,
      email,
    });
  } catch (error) {
    console.error("Error fetching email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch email",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/outlook/emails/[id]
 * E-postayı siler
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;
    await deleteEmail(id, userId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete email",
      },
      { status: 500 }
    );
  }
}
