import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/services/graph-service";

/**
 * POST /api/admin/outlook/send
 * E-posta gönderir ve thread takibi için conversationId döner
 * 
 * NOT: Bu API genel amaçlı email gönderimi içindir.
 * Template sarmalama işlemi çağıran tarafta yapılmalıdır.
 */
export async function POST(request) {
  try {
    const emailData = await request.json();

    // Validate required fields
    if (!emailData.to || !emailData.subject || !emailData.body) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: to, subject, body",
        },
        { status: 400 }
      );
    }

    // Pass userId for sender selection if provided
    const result = await sendEmail({
      ...emailData,
      userId: emailData.userId || undefined,
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      conversationId: result.conversationId,
      internetMessageId: result.internetMessageId,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send email",
      },
      { status: 500 }
    );
  }
}
