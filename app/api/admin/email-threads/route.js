/**
 * Email Threads API
 * E-posta thread yönetimi
 * 
 * GET: Aktif thread'leri listele
 * POST: Yeni thread oluştur
 */

import { NextResponse } from "next/server";
import { 
  createEmailThread, 
  getActiveThreads, 
  getThreadsByRequestId 
} from "@/lib/services/email-thread-service";

/**
 * Aktif thread'leri listeler
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("requestId");

    let threads;
    if (requestId) {
      threads = await getThreadsByRequestId(requestId);
    } else {
      threads = await getActiveThreads();
    }

    return NextResponse.json({
      success: true,
      threads,
      count: threads.length,
    });
  } catch (error) {
    console.error("Get threads error:", error);
    return NextResponse.json(
      { error: "Thread listesi alınamadı: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * Yeni thread oluşturur
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    const { 
      conversationId, 
      messageId, 
      internetMessageId,
      requestId, 
      companyId,
      communicationId,
      subject,
      toEmail,
      fromEmail,
      createdBy,
      createdByName,
    } = body;

    if (!conversationId || !messageId) {
      return NextResponse.json(
        { error: "conversationId ve messageId gerekli" },
        { status: 400 }
      );
    }

    const result = await createEmailThread({
      conversationId,
      messageId,
      internetMessageId,
      requestId,
      companyId,
      communicationId,
      subject,
      toEmail,
      fromEmail,
      createdBy,
      createdByName,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      threadId: result.id,
      message: result.message,
    });
  } catch (error) {
    console.error("Create thread error:", error);
    return NextResponse.json(
      { error: "Thread oluşturulamadı: " + error.message },
      { status: 500 }
    );
  }
}
