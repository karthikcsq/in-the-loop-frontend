export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface InterruptPrompt {
  question: string;
  options?: string[] | null;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  interrupt: InterruptPrompt | null;
}
