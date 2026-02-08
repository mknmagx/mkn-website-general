/**
 * Telefon Numarası Normalizasyon API
 * 
 * Bu endpoint mevcut veritabanındaki telefon numaralarını normalize eder.
 * 
 * GET /api/admin/crm-v2/phone-migration?action=preview
 * - Değişiklikleri önizler, güncelleme yapmaz
 * 
 * POST /api/admin/crm-v2/phone-migration
 * - Gerçek migration'ı çalıştırır
 * - Body: { dryRun: boolean, limit: number, collections: string[] }
 */

import { NextResponse } from "next/server";
import { 
  previewPhoneNormalization, 
  migratePhoneNumbers 
} from "@/lib/services/crm-v2/phone-normalization-migration";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'preview') {
      const report = await previewPhoneNormalization();
      
      return NextResponse.json({
        success: true,
        message: 'Phone normalization preview completed',
        data: report,
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use ?action=preview',
    }, { status: 400 });
    
  } catch (error) {
    console.error('[API] Phone migration preview error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      dryRun = false, 
      limit = 1000,
      collections = ['customers', 'conversations', 'companies']
    } = body;
    
    console.log(`[API] Starting phone migration - dryRun: ${dryRun}, limit: ${limit}, collections: ${collections.join(', ')}`);
    
    const results = await migratePhoneNumbers({
      dryRun,
      limit,
      collections,
    });
    
    return NextResponse.json({
      success: true,
      message: dryRun ? 'Dry run completed (no changes made)' : 'Phone migration completed',
      data: results,
    });
    
  } catch (error) {
    console.error('[API] Phone migration error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
