/**
 * WhatsApp Media Upload API Route
 * POST: Medya yükle (Cloudinary üzerinden)
 */

import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Allowed media types and their configurations
const MEDIA_CONFIG = {
  image: {
    folder: 'whatsapp/images',
    resourceType: 'image',
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  video: {
    folder: 'whatsapp/videos',
    resourceType: 'video',
    allowedTypes: ['video/mp4', 'video/3gpp', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
    maxSize: 16 * 1024 * 1024, // 16MB
  },
  document: {
    folder: 'whatsapp/documents',
    resourceType: 'raw',
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
    ],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  audio: {
    folder: 'whatsapp/audio',
    resourceType: 'video', // Cloudinary uses 'video' for audio
    allowedTypes: [
      'audio/aac',
      'audio/mp4',
      'audio/mpeg',
      'audio/amr',
      'audio/ogg',
    ],
    maxSize: 16 * 1024 * 1024, // 16MB
  },
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type') || 'image';

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'Dosya gerekli',
      }, { status: 400 });
    }

    // Get media config
    const config = MEDIA_CONFIG[type];
    if (!config) {
      return NextResponse.json({
        success: false,
        error: 'Geçersiz medya tipi',
      }, { status: 400 });
    }

    // Check file size
    if (file.size > config.maxSize) {
      return NextResponse.json({
        success: false,
        error: `Dosya çok büyük. Maksimum boyut: ${config.maxSize / 1024 / 1024}MB`,
      }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name?.replace(/[^a-zA-Z0-9.-]/g, '_') || 'file';
    const publicId = `${timestamp}_${originalName}`;

    console.log(`[WhatsApp Media Upload] Uploading ${type}: ${originalName}, size: ${file.size}, type: ${file.type}`);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: config.resourceType,
          folder: config.folder,
          public_id: publicId,
          // Video için ek ayarlar
          ...(type === 'video' && {
            eager: [{ format: 'mp4' }],
            eager_async: true,
          }),
        },
        (error, result) => {
          if (error) {
            console.error('[WhatsApp Media Upload] Cloudinary error:', error);
            reject(error);
          } else {
            console.log('[WhatsApp Media Upload] Success:', result.secure_url);
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      mediaUrl: uploadResult.secure_url,
      mediaId: uploadResult.public_id,
      format: uploadResult.format,
      size: uploadResult.bytes,
    });
  } catch (error) {
    console.error('WhatsApp media upload error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Dosya yüklenemedi',
      details: error.http_code ? `Cloudinary error: ${error.http_code}` : undefined,
    }, { status: 500 });
  }
}
