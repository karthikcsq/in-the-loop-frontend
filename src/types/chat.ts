export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface InterruptPrompt {
  question: string;
  // Options can be a simple array of strings (legacy) or a map of label -> description
  options?: string[] | Record<string, string> | null;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  interrupt: InterruptPrompt | null;
}
