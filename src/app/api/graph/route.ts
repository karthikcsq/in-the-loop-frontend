import { NextRequest, NextResponse } from 'next/server';

// Prefer an explicit env override; otherwise use localhost only in development.
// This avoids accidentally calling 127.0.0.1 in production when a custom DEV var is set.
const PY_BACKEND_URL =
  process.env.PY_BACKEND_URL?.trim() ||
  (process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:8000'
    : 'https://in-the-loop-python.onrender.com');

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

    const targetUrl = `${PY_BACKEND_URL.replace(/\/$/, '')}${endpoint}`;

    // Small retry helper for cold starts/transient network issues
    const tryFetch = async (attempt: number): Promise<Response> => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
      try {
        return await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
      } catch (err) {
        if (attempt < 2) {
          // backoff 500ms then 1500ms
          const delay = attempt === 0 ? 500 : 1500;
          await new Promise((r) => setTimeout(r, delay));
          return tryFetch(attempt + 1);
        }
        throw err;
      } finally {
        clearTimeout(timeout);
      }
    };

    const resp = await tryFetch(0);

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
  } catch (e: unknown) {
    // Include minimal context to help diagnose environment misconfigurations without leaking secrets.
    const msg = (e as Error)?.message || 'Failed to reach backend';
    return NextResponse.json(
      { error: msg, hint: 'backend_fetch_failed', backend: PY_BACKEND_URL },
      { status: 500 }
    );
  }
}
