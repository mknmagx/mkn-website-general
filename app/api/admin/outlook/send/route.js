import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/services/graph-service";

/**
 * POST /api/admin/outlook/send
 * E-posta gönderir ve thread takibi için conversationId döner
 * 
 * NOT: Bu API genel amaçlı email gönderimi içindir.
 * Template sarmalama işlemi çağıran tarafta yapılmalıdır.
 * 
 * 🔥 BÜYÜK DOSYA SINIRLAMASI:
 * - Vercel serverless function limit: 4.5MB payload
 * - Max attachment size: 3MB (total, base64 encoded)
 * - Büyük dosyalar için Firebase Storage kullanın
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
    
    // Özel hata mesajları
    let errorMessage = error.message || "Failed to send email";
    let statusCode = 500;
    
    // Payload size hatası
    if (error.message && error.message.includes('boyut')) {
      statusCode = 413; // Payload Too Large
      errorMessage = error.message;
    }
    // Graph API authentication hatası
    else if (error.message && error.message.includes('authentication')) {
      statusCode = 401;
      errorMessage = "Email gönderme yetkisi yok. Lütfen tekrar giriş yapın.";
    }
    // Graph API rate limit
    else if (error.message && error.message.includes('429')) {
      statusCode = 429;
      errorMessage = "Çok fazla istek. Lütfen birkaç saniye bekleyin.";
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}
