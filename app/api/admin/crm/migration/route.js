/**
 * CRM Conversation Migration API
 * 
 * Duplicate conversation'ları birleştirmek için API endpoint'leri
 * 
 * Endpoints:
 * - GET: Analiz sonuçlarını al
 * - POST: Migration işlemini başlat
 */

import { NextResponse } from "next/server";
import { 
  analyzeDuplicateConversations, 
  mergeAllDuplicates,
  mergeConversationGroup,
  getMigrationStats,
} from "@/lib/services/crm-v2/conversation-migration-service";

/**
 * GET - Duplicate conversation analizi
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'stats'; // 'stats' veya 'full'
    
    if (mode === 'full') {
      // Tam analiz (tüm grupların detayları)
      const analysis = await analyzeDuplicateConversations();
      return NextResponse.json(analysis);
    } else {
      // Sadece istatistikler
      const stats = await getMigrationStats();
      return NextResponse.json(stats);
    }
  } catch (error) {
    console.error('[Migration API] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Migration işlemini başlat
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      action = 'analyze', // 'analyze', 'merge-all', 'merge-group'
      dryRun = true, // Varsayılan olarak dry-run (test)
      deleteDuplicates = true, // true: sil, false: arşivle
      maxGroups = null, // Test için sınırlı sayıda grup
      // merge-group için
      primaryId = null,
      duplicateIds = [],
      // İşlemi yapan kullanıcı
      createdBy = null,
    } = body;
    
    console.log('[Migration API] POST request:', { action, dryRun, deleteDuplicates, maxGroups });
    
    switch (action) {
      case 'analyze':
        // Sadece analiz
        const analysis = await analyzeDuplicateConversations();
        return NextResponse.json(analysis);
        
      case 'stats':
        // İstatistikler
        const stats = await getMigrationStats();
        return NextResponse.json(stats);
        
      case 'merge-all':
        // Tüm duplicate'leri birleştir
        const mergeAllResult = await mergeAllDuplicates({
          dryRun,
          createdBy,
          deleteDuplicates,
          maxGroups,
        });
        return NextResponse.json(mergeAllResult);
        
      case 'merge-group':
        // Tek bir grubu birleştir
        if (!primaryId || !duplicateIds || duplicateIds.length === 0) {
          return NextResponse.json(
            { success: false, error: 'primaryId and duplicateIds required' },
            { status: 400 }
          );
        }
        
        const mergeGroupResult = await mergeConversationGroup(
          primaryId,
          duplicateIds,
          { dryRun, createdBy, deleteDuplicates }
        );
        return NextResponse.json(mergeGroupResult);
        
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Migration API] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
