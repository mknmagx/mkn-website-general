/**
 * Email Thread Check API
 * Aktif e-posta thread'lerini kontrol eder ve yeni yanıtları iletişim geçmişine ekler
 * 
 * GET: Tüm aktif thread'leri kontrol et
 * POST: Belirli bir thread'i kontrol et
 */

import { NextResponse } from "next/server";
import { 
  checkAllThreadsForReplies, 
  checkThreadForReplies,
  getThreadByConversationId,
  updateThread,
  emailToCommmunicationData,
} from "@/lib/services/email-thread-service";
import CommunicationService from "@/lib/services/communication-service";
import { Timestamp, serverTimestamp } from "firebase/firestore";

/**
 * Tüm aktif thread'leri kontrol eder (polling için)
 */
export async function GET() {
  try {
    const result = await checkAllThreadsForReplies();
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Yeni yanıtları iletişim geçmişine ekle
    const importedCommunications = [];
    
    for (const { thread, newReplies } of result.results) {
      for (const reply of newReplies) {
        // Daha önce import edilmiş mi kontrol et
        const existsCheck = await CommunicationService.existsByOutlookMessageId(reply.id);
        if (existsCheck.exists) continue;

        // E-postayı communication kaydına dönüştür
        const commData = emailToCommmunicationData(reply, thread);
        
        // Kaydet
        const createResult = await CommunicationService.create(commData);
        
        if (createResult.success) {
          importedCommunications.push({
            communicationId: createResult.id,
            subject: reply.subject,
            from: reply.from?.emailAddress?.address,
            requestId: thread.requestId,
            threadId: thread.id,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      checkedThreads: result.checkedCount,
      threadsWithReplies: result.threadsWithReplies,
      importedCount: importedCommunications.length,
      imported: importedCommunications,
    });
  } catch (error) {
    console.error("Thread check error:", error);
    return NextResponse.json(
      { error: "Thread kontrol hatası: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * Belirli bir thread'i kontrol eder
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { conversationId, threadId } = body;

    if (!conversationId && !threadId) {
      return NextResponse.json(
        { error: "conversationId veya threadId gerekli" },
        { status: 400 }
      );
    }

    // Thread'i bul
    let thread;
    if (conversationId) {
      thread = await getThreadByConversationId(conversationId);
    }
    
    if (!thread) {
      return NextResponse.json(
        { error: "Thread bulunamadı" },
        { status: 404 }
      );
    }

    // Yanıtları kontrol et
    const check = await checkThreadForReplies(thread);
    
    if (!check.success) {
      return NextResponse.json(
        { error: check.error },
        { status: 500 }
      );
    }

    // Yeni yanıtları iletişim geçmişine ekle
    const importedCommunications = [];
    
    for (const reply of check.newReplies) {
      // Daha önce import edilmiş mi kontrol et
      const existsCheck = await CommunicationService.existsByOutlookMessageId(reply.id);
      if (existsCheck.exists) continue;

      const commData = emailToCommmunicationData(reply, thread);
      const createResult = await CommunicationService.create(commData);
      
      if (createResult.success) {
        importedCommunications.push({
          communicationId: createResult.id,
          subject: reply.subject,
          from: reply.from?.emailAddress?.address,
        });
      }
    }

    // Thread'i güncelle
    await updateThread(thread.id, {
      lastCheckedAt: serverTimestamp(),
      replyCount: check.totalReplies,
      ...(check.newReplies.length > 0 && {
        lastReplyAt: Timestamp.fromDate(new Date(check.newReplies[0].receivedDateTime)),
      }),
    });

    return NextResponse.json({
      success: true,
      threadId: thread.id,
      hasNewReplies: check.hasNewReplies,
      totalReplies: check.totalReplies,
      newRepliesCount: check.newReplies.length,
      importedCount: importedCommunications.length,
      imported: importedCommunications,
    });
  } catch (error) {
    console.error("Thread check error:", error);
    return NextResponse.json(
      { error: "Thread kontrol hatası: " + error.message },
      { status: 500 }
    );
  }
}
