import { NextResponse } from "next/server";
import { getStorage } from "firebase-admin/storage";
import admin from "@/lib/firebase-admin";

/**
 * Upload user-selected images to Firebase Storage
 * Used by Gemini chat to persist user-uploaded images
 * 
 * POST /api/upload-user-images
 * Body: {
 *   base64Data: string (without data:image/... prefix),
 *   mimeType: string (e.g., 'image/jpeg'),
 *   filename: string (path in storage)
 * }
 * 
 * Returns: { url: string, filename: string, size: number }
 */
export async function POST(request) {
  try {
    const { base64Data, mimeType, filename } = await request.json();

    // Validate input
    if (!base64Data || !mimeType || !filename) {
      return NextResponse.json(
        { error: "Missing required fields: base64Data, mimeType, filename" },
        { status: 400 }
      );
    }

    // Validate base64 data
    if (typeof base64Data !== 'string' || base64Data.length === 0) {
      return NextResponse.json(
        { error: "Invalid base64Data" },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, "base64");
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (imageBuffer.length > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size: ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    console.log(`📤 Uploading to storage: ${filename}`);
    console.log(`   - MIME type: ${mimeType}`);
    console.log(`   - Size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);

    // Get Firebase Storage bucket
    const bucket = getStorage().bucket();
    const file = bucket.file(filename);

    // Upload file with metadata
    await file.save(imageBuffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          uploadedBy: "gemini-chat-user",
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    // Make file public
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    console.log(`✅ Upload successful: ${publicUrl}`);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      size: imageBuffer.length,
      mimeType: mimeType,
    });

  } catch (error) {
    console.error("❌ Upload error:", error);
    
    return NextResponse.json(
      {
        error: "Upload failed",
        message: error.message,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/upload-user-images",
    methods: ["POST"],
    description: "Upload user images to Firebase Storage for Gemini chat",
  });
}
