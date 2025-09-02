# In-The-Loop Frontend (Next.js)

This frontend provides a chat interface that connects to the Python backend exposing a LangGraph agent. It renders a simple conversation view and manages a session (thread) per conversation.

## Deployed URL: https://in-the-loop-ai.vercel.app/


## Local Hosting
## Prerequisites

- Node.js 18+
- Python backend running locally at `http://127.0.0.1:8000` (or configure `PY_BACKEND_URL`)

## Setup

Install dependencies:

```powershell
npm install
```

Optional environment configuration in `.env.local`:

```env
# Override if your backend is not on localhost:8000
PY_BACKEND_URL=http://127.0.0.1:8000
```

## Development

Start the dev server:

```powershell
npm run dev
```

Open http://localhost:3000. The chat UI will use the `/api/graph` proxy to communicate with the Python service.

## API Integration

The frontend defines two API routes under `src/app/api/`:

- `chat/route.ts`: talks directly to OpenAI (legacy path). Remains available.
- `graph/route.ts`: proxies to the Python backend and normalizes responses.

The `useChat` hook targets `/api/graph` and:

- Creates a `threadId` per conversation.
- Sends the first message with `mode: "start"` and an optional `taskType`.
- Sends subsequent messages with `mode: "resume"`.
- Expects either an interrupt (clarifying question) or a final answer from the backend.

## Customization

- Display clarification options: the proxy returns an `options` array when the backend asks a question. Surface these options in the UI if desired.
- Task type: default is `essay`. Add a selector in the UI and pass it through `useChat` on the first message.

## Troubleshooting

- 500 from `/api/graph`: verify the Python backend is running and reachable at `PY_BACKEND_URL`.
- CORS errors in the browser: update the backend CORS configuration in `graph_api.py` or use the same origin in development.
- Type errors: this project uses strict TypeScript settings; run `npm run lint` for details.
