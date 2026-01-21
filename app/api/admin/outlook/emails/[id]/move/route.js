import { NextResponse } from "next/server";
import { moveEmail } from "@/lib/services/graph-service";

/**
 * POST /api/admin/outlook/emails/[id]/move
 * E-postayı başka bir klasöre taşı
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;
    const { destinationId } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Email ID is required" },
        { status: 400 }
      );
    }

    if (!destinationId) {
      return NextResponse.json(
        { success: false, error: "Destination folder ID is required" },
        { status: 400 }
      );
    }

    const result = await moveEmail(id, destinationId, userId);

    return NextResponse.json({
      success: true,
      message: result,
    });
  } catch (error) {
    console.error("Error moving email:", error);
    
    const isAccessDenied = error.message?.includes("403") || 
                          error.message?.includes("AccessDenied") ||
                          error.message?.includes("Access is denied");
    
    if (isAccessDenied) {
      return NextResponse.json(
        {
          success: false,
          error: "Yetki hatası: Azure AD uygulamasının Mail.ReadWrite izni gerekiyor.",
          code: "ACCESS_DENIED"
        },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to move email",
      },
      { status: 500 }
    );
  }
}
