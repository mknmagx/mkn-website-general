/**
 * WhatsApp Webhook API Route
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
  getSettings,
} from '@/lib/services/whatsapp';

// Webhook verification (GET)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    console.log('WhatsApp Webhook verification request:', params);

    // Get verify token
    const verifyToken = await getOrCreateWebhookVerifyToken();

    const result = verifyWebhook(params, verifyToken);

    if (result.success) {
      // Meta expects challenge as plain text
      return new Response(result.challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    console.warn('Webhook verification failed');
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
    // Get raw body for signature validation
    const rawBody = await request.text();
    const body = parseWebhookPayload(rawBody);

    if (!body) {
      console.error('Invalid webhook payload');
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    console.log('WhatsApp Webhook received:', JSON.stringify(body).slice(0, 500));

    // Signature validation (recommended for production)
    const signature = request.headers.get('x-hub-signature-256');
    const settings = await getSettings();
    const appSecret = settings?.appSecret;

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

    // Process event
    const result = await handleWebhookEvent(body);

    console.log('Webhook processing result:', result);

    // Meta always expects 200 OK
    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    console.error('Webhook handler error:', error);
    // Return 200 even on error (prevent Meta from retrying)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 200 }
    );
  }
}
