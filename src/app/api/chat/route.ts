import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { messages, apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: 1000,
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0]?.message?.content;

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: {
        role: 'assistant',
        content: assistantMessage,
      },
    });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Invalid API key provided' },
        { status: 401 }
      );
    }
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'API quota exceeded' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get response from OpenAI' },
      { status: 500 }
    );
  }
}
