import { NextResponse } from "next/server";
import { markEmailAsRead } from "@/lib/services/graph-service";

/**
 * PATCH /api/admin/outlook/emails/[id]/read
 * E-postayı okundu veya okunmadı olarak işaretle
 * Query params:
 *   - userId: Mailbox kullanıcı ID'si
 *   - isRead: true (okundu) veya false (okunmadı) - varsayılan: true
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;
    const isRead = searchParams.get("isRead") !== "false"; // Varsayılan olarak true
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Email ID is required" },
        { status: 400 }
      );
    }

    await markEmailAsRead(id, isRead, userId);

    return NextResponse.json({
      success: true,
      isRead: isRead,
    });
  } catch (error) {
    console.error("Error marking email as read/unread:", error);
    
    // Azure AD yetki hatası kontrolü
    const isAccessDenied = error.message?.includes("403") || 
                          error.message?.includes("AccessDenied") ||
                          error.message?.includes("Access is denied");
    
    if (isAccessDenied) {
      return NextResponse.json(
        {
          success: false,
          error: "Yetki hatası: Azure AD uygulamasının Mail.ReadWrite izni gerekiyor. Lütfen sistem yöneticisine başvurun.",
          code: "ACCESS_DENIED"
        },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update email read status",
      },
      { status: 500 }
    );
  }
}
