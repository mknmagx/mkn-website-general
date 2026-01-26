import { NextResponse } from "next/server";

/**
 * POST /api/admin/storage-proxy
 * Firebase Storage'dan dosya indirip Base64 döner (CORS bypass)
 */
export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL gerekli" },
        { status: 400 }
      );
    }

    // Firebase Storage URL kontrolü
    if (!url.includes('firebasestorage.googleapis.com')) {
      return NextResponse.json(
        { success: false, error: "Geçersiz Storage URL" },
        { status: 400 }
      );
    }

    // Dosyayı indir
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Dosya indirilemedi: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    return NextResponse.json({
      success: true,
      contentBytes: base64,
      contentType: contentType,
      size: buffer.length,
    });
  } catch (error) {
    console.error("Storage proxy error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
