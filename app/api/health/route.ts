import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'API is working',
      timestamp: new Date().toISOString(),
      puppeteer: 'ready'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'API error',
      error: (error as Error).message
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    return NextResponse.json({
      status: 'POST method working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'POST error',
      error: (error as Error).message
    }, { status: 500 });
  }
}