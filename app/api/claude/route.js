import { NextResponse } from 'next/server';
import { claudeService } from '@/lib/claude';

export async function POST(request) {
  try {
    const { message, systemPrompt, maxTokens, type } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    let response;

    switch (type) {
      case 'chat':
        response = await claudeService.sendMessage(message, systemPrompt, maxTokens);
        break;
      case 'generate':
        response = await claudeService.generateContent(message, { systemPrompt, maxTokens });
        break;
      case 'analyze':
        const analysisType = systemPrompt || 'general';
        response = await claudeService.analyzeText(message, analysisType);
        break;
      case 'conversation':
        // Expecting message to be an array of conversation messages
        response = await claudeService.chatConversation(message, systemPrompt);
        break;
      default:
        response = await claudeService.sendMessage(message, systemPrompt, maxTokens);
    }

    return NextResponse.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Claude API route error:', error);
    
    return NextResponse.json(
      { 
        error: 'Claude service error',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Claude API endpoint is running',
    endpoints: {
      POST: '/api/claude',
      types: ['chat', 'generate', 'analyze', 'conversation']
    }
  });
}