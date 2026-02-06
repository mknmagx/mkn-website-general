/**
 * WhatsApp Media Upload API Route
 * POST: Medya yükle (Firebase Storage üzerinden)
 */

import { NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';

// Allowed media types and their configurations
const MEDIA_CONFIG = {
  image: {
    folder: 'whatsapp/outbound/images',
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  video: {
    folder: 'whatsapp/outbound/videos',
    allowedTypes: ['video/mp4', 'video/3gpp', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
    maxSize: 16 * 1024 * 1024, // 16MB
  },
  document: {
    folder: 'whatsapp/outbound/documents',
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
    folder: 'whatsapp/outbound/audio',
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
    const filename = `${config.folder}/${timestamp}_${originalName}`;

    console.log(`[WhatsApp Media Upload] Uploading ${type}: ${originalName}, size: ${file.size}, type: ${file.type}`);

    // Upload to Firebase Storage
    const bucket = admin.storage().bucket('mkngroup-general.firebasestorage.app');
    const storageFile = bucket.file(filename);

    await storageFile.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          source: 'whatsapp-admin',
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    // Make file publicly accessible
    await storageFile.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    console.log(`[WhatsApp Media Upload] Success: ${publicUrl}`);

    return NextResponse.json({
      success: true,
      mediaUrl: publicUrl,
      mediaId: filename,
      format: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error('WhatsApp media upload error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Dosya yüklenemedi',
    }, { status: 500 });
  }
}
