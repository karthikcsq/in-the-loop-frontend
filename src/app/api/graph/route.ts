import { NextRequest, NextResponse } from 'next/server';

const PY_BACKEND_URL = process.env.PY_BACKEND_URL || 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  try {
    const { threadId, message, mode, taskType } = await request.json();

    if (!threadId || !message || !mode) {
      return NextResponse.json(
        { error: 'threadId, message, and mode are required' },
        { status: 400 }
      );
    }

    const endpoint = mode === 'start' ? '/start' : '/resume';
    const body =
      mode === 'start'
        ? { thread_id: threadId, essay_prompt: message, task_type: taskType }
        : { thread_id: threadId, value: message };

    const resp = await fetch(`${PY_BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return NextResponse.json({ error: data?.detail || 'Backend error' }, { status: 500 });
    }

    if (data.type === 'interrupt') {
      return NextResponse.json({
        message: { role: 'assistant', content: data.query ?? 'I have a clarification question.' },
        interrupt: true,
        options: data.options ?? null,
      });
    }

    if (data.type === 'final') {
      return NextResponse.json({
        message: { role: 'assistant', content: data.draft },
        interrupt: false,
      });
    }

    return NextResponse.json({ error: data.error || 'Unexpected backend response' }, { status: 500 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to reach backend' }, { status: 500 });
  }
}
