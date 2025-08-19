import { useState, useCallback } from 'react';
import { Message, ChatState } from '@/types/chat';

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
  // Maintain a thread id per conversation for LangGraph
  const [threadId, setThreadId] = useState<string>(
    () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`)
  );
  // Default task type; could be switched by UI later
  const [taskType] = useState<string>('essay');

  const sendMessage = useCallback(
    async (content: string, apiKey?: string) => {
      if (!content.trim()) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        error: null,
      }));

      // Decide if this starts a new graph run or resumes an interrupt
      const mode = state.messages.length === 0 ? 'start' : 'resume';

      try {
        const response = await fetch('/api/graph', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadId,
            message: userMessage.content,
            mode,
            taskType: mode === 'start' ? taskType : undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send message');
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message.content,
          timestamp: new Date(),
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
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
    [state.messages, threadId, taskType]
  );

  const clearMessages = useCallback(() => {
    setState({ messages: [], isLoading: false, error: null });
    setThreadId(globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`);
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    sendMessage,
    clearMessages,
    clearError,
  };
};
