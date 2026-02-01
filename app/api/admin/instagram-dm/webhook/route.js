/**
 * Instagram DM Webhook API Route
 * GET: Webhook verification
 * POST: Webhook event handler
 */

import { NextResponse } from 'next/server';
import {
  verifyWebhook,
  validateSignature,
  handleWebhookEvent,
  parseWebhookPayload,
  getOrCreateWebhookVerifyToken,
} from '@/lib/services/instagram-dm';

// Webhook verification (GET)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Verify token'ı al
    const verifyToken = await getOrCreateWebhookVerifyToken();

    const result = verifyWebhook(params, verifyToken);

    if (result.success) {
      // Meta, challenge değerini plain text olarak bekler
      return new Response(result.challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    return NextResponse.json(
      { error: result.error },
      { status: 403 }
    );
  } catch (error) {
    console.error('Webhook verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Webhook event handler (POST)
export async function POST(request) {
  try {
    // Raw body al (signature validation için)
    const rawBody = await request.text();
    const body = parseWebhookPayload(rawBody);

    if (!body) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Signature validation (production'da aktif edilmeli)
    const signature = request.headers.get('x-hub-signature-256');
    const appSecret = process.env.INSTAGRAM_APP_SECRET;

    if (appSecret && signature) {
      const isValid = validateSignature(rawBody, signature, appSecret);
      if (!isValid) {
        console.warn('Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Event'i işle
    const result = await handleWebhookEvent(body);

    // Meta her zaman 200 OK bekler
    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    console.error('Webhook handler error:', error);
    // Hata durumunda bile 200 dön (Meta retry yapmaya devam etmesin)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 200 }
    );
  }
}
