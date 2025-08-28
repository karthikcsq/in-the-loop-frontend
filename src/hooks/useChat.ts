import { useState, useCallback } from 'react';
import { Message, ChatState, InterruptPrompt } from '@/types/chat';

// Types for API payloads and responses
type Mode = 'start' | 'resume';
type TaskType = 'none' | 'essay' | 'code';

type StartRequest = {
  threadId: string;
  message: string;
  mode: 'start';
  taskType?: Exclude<TaskType, 'none'>;
};

type ResumeRequest = {
  threadId: string;
  message: string;
  mode: 'resume';
};

type GraphRequestBody = StartRequest | ResumeRequest;

type ApiAssistantMessage = { role: 'assistant'; content: string };
type InterruptResponse = {
  message: ApiAssistantMessage;
  interrupt: true;
  options: InterruptPrompt['options'];
};
type FinalResponse = { message: ApiAssistantMessage; interrupt: false };
type ErrorResponse = { error: string };
type GraphResponse = InterruptResponse | FinalResponse | ErrorResponse;

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    interrupt: null,
  });
  // Maintain a thread id per conversation for LangGraph
  const [threadId, setThreadId] = useState<string>(
    () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`)
  );

  const sendMessage = useCallback(
    async (
      content: string,
      apiKey?: string,
      taskType?: TaskType
    ) => {
      if (!content.trim()) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      // Decide if this starts a new graph run or resumes an interrupt
      const mode: Mode = state.interrupt ? 'resume' : 'start';

      // Determine the thread id to send for this request (reuse existing thread unless user starts a New Chat)
      // let currentThreadId = threadId;

      // Mark run as active
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        error: null,
      }));

      try {
        let body: GraphRequestBody = {
          threadId: threadId,
          message: userMessage.content,
          mode,
        };
        if (mode === 'start') {
          // Only send taskType on the first message; omit if 'none'
          const t = taskType && taskType !== 'none' ? taskType : undefined;
          if (t) {
            body = { ...(body as StartRequest), taskType: t };
          }
        }

        const response = await fetch('/api/graph', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = (await response.json()) as GraphResponse;

        if (!response.ok) {
          const errMsg = 'error' in data ? data.error : undefined;
          throw new Error(errMsg || 'Failed to send message');
        }

        // If backend asks an interrupt question, show transient prompt instead of adding a message
        if ('interrupt' in data && data.interrupt) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            interrupt: {
              question: data.message?.content ?? 'I have a clarification question.',
              options: data.options ?? null,
            },
          }));
          return;
        }

        // Otherwise treat as a normal assistant message (final or non-interrupt)
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'message' in data ? data.message.content : '',
          timestamp: new Date(),
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
          interrupt: null,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error ? error.message : 'An error occurred',
        }));
      }
    },
    [state.interrupt, threadId]
  );

  // Answer an interrupt prompt without adding it as a chat message
  const sendInterruptAnswer = useCallback(
    async (answer: string) => {
      if (!answer.trim()) return;

      // Clear the interrupt right away so the UI hides the prompt and shows typing
      setState((prev) => ({ ...prev, isLoading: true, interrupt: null }));

      try {
        const response = await fetch('/api/graph', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ threadId, message: answer.trim(), mode: 'resume' }),
        });

        const data = (await response.json()) as GraphResponse;
        if (!response.ok) {
          throw new Error(('error' in data && data.error) || 'Failed to send interrupt answer');
        }

        if ('interrupt' in data && data.interrupt) {
          // Chain of interrupts: replace the prompt
          setState((prev) => ({
            ...prev,
            isLoading: false,
            interrupt: {
              question: data.message?.content ?? 'I have a clarification question.',
              options: data.options ?? null,
            },
          }));
          return;
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'message' in data ? data.message.content : '',
          timestamp: new Date(),
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
          interrupt: null,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        }));
      }
    },
    [threadId]
  );

  const clearMessages = useCallback(() => {
    setState({ messages: [], isLoading: false, error: null, interrupt: null });
    setThreadId(globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`);
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    sendMessage,
    sendInterruptAnswer,
    clearMessages,
    clearError,
  };
};
