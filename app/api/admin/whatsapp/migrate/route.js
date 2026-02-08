/**
 * WhatsApp-CRM Migration API
 * 
 * Bu endpoint eski CRM conversation'larını WhatsApp metadata'sıyla günceller.
 * 
 * GET /api/admin/whatsapp/migrate?action=preview
 * - Değişiklikleri önizler, güncelleme yapmaz
 * 
 * POST /api/admin/whatsapp/migrate
 * - Gerçek migration'ı çalıştırır
 * - Body: { dryRun: boolean, limit: number }
 */

import { NextResponse } from "next/server";
import { previewMigration, migrateWhatsAppConversations } from "@/lib/services/crm-v2/whatsapp-migration-service";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'preview') {
      const report = await previewMigration();
      
      return NextResponse.json({
        success: true,
        message: 'Migration preview completed',
        data: report,
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use ?action=preview',
    }, { status: 400 });
    
  } catch (error) {
    console.error('[API] Migration preview error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { dryRun = false, limit = 1000 } = body;
    
    console.log(`[API] Starting migration - dryRun: ${dryRun}, limit: ${limit}`);
    
    const results = await migrateWhatsAppConversations({
      dryRun,
      limit,
    });
    
    return NextResponse.json({
      success: true,
      message: dryRun ? 'Dry run completed (no changes made)' : 'Migration completed',
      data: results,
    });
    
  } catch (error) {
    console.error('[API] Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
