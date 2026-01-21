/**
 * Email Sync API Endpoint
 * 
 * CRM v2 için Outlook inbox emaillerini senkronize eder.
 * 
 * ⚠️ Bu API artık sync-service.js'teki lock mekanizmasını kullanır.
 * Paralel sync işlemleri engellenmiştir.
 * 
 * POST: Manuel veya otomatik sync tetikle
 * GET: Sync durumu ve istatistikleri al
 */

import { NextResponse } from "next/server";
import { 
  syncInboxEmails, 
  fullEmailSync,
  getEmailSyncStats,
  autoEmailSyncIfNeeded,
} from "@/lib/services/crm-v2/email-sync-service";

// =============================================================================
// POST - Email Sync Tetikle
// =============================================================================
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { 
      type = 'incremental', // 'incremental', 'full', 'auto'
      userId = null,
      days = 30, // Full sync için gün sayısı
    } = body;
    
    console.log(`[Email Sync API] Sync requested - type: ${type}, userId: ${userId}`);
    
    let result;
    
    switch (type) {
      case 'full':
        // Tam senkronizasyon
        result = await fullEmailSync(userId, days);
        break;
        
      case 'auto':
        // Otomatik kontrol (15 dakika kuralı)
        result = await autoEmailSyncIfNeeded(userId);
        break;
        
      case 'incremental':
      default:
        // Artımlı senkronizasyon (sadece yeni emailler)
        result = await syncInboxEmails({ userId });
        break;
    }
    
    // 🔒 Lock nedeniyle skip edildiyse
    if (result.skipReason === 'sync_locked') {
      return NextResponse.json({
        success: false,
        skipped: true,
        locked: true,
        message: result.message || "Başka bir senkronizasyon işlemi devam ediyor.",
      }, { status: 423 }); // 423 Locked
    }
    
    if (result.skipped) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: "Senkronizasyon atlandı - yakın zamanda yapılmış.",
        reason: result.reason || result.skipReason,
      });
    }
    
    return NextResponse.json({
      success: result.success,
      data: {
        imported: result.imported,
        skipped: result.skipped,
        addedToThread: result.addedToThread,
        errors: result.errors?.length || 0,
        details: result.details?.slice(0, 10), // İlk 10 detay
      },
      message: result.success 
        ? `${result.imported} email import edildi, ${result.addedToThread} thread'e eklendi.`
        : "Senkronizasyon sırasında hata oluştu.",
    });
    
  } catch (error) {
    console.error("[Email Sync API] Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Senkronizasyon başarısız oldu." 
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET - Sync Durumu ve İstatistikler
// =============================================================================
export async function GET() {
  try {
    const stats = await getEmailSyncStats();
    
    if (!stats) {
      return NextResponse.json({
        success: false,
        error: "İstatistikler alınamadı.",
      }, { status: 500 });
    }
    
    // Sync durumu mesajı
    let syncStatusMessage = "Henüz senkronize edilmedi";
    if (stats.sync.lastSyncAt) {
      const lastSyncDate = new Date(stats.sync.lastSyncAt);
      const diffMinutes = Math.round((new Date() - lastSyncDate) / (1000 * 60));
      
      if (diffMinutes < 1) {
        syncStatusMessage = "Az önce senkronize edildi";
      } else if (diffMinutes < 60) {
        syncStatusMessage = `${diffMinutes} dakika önce`;
      } else if (diffMinutes < 1440) {
        syncStatusMessage = `${Math.round(diffMinutes / 60)} saat önce`;
      } else {
        syncStatusMessage = `${Math.round(diffMinutes / 1440)} gün önce`;
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        outlook: stats.outlook,
        crm: stats.crm,
        sync: {
          ...stats.sync,
          statusMessage: syncStatusMessage,
        },
      },
    });
    
  } catch (error) {
    console.error("[Email Sync API] GET Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "İstatistikler alınamadı." 
      },
      { status: 500 }
    );
  }
}
