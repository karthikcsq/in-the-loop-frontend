'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useChat } from '@/hooks/useChat';
import { Message } from '@/components/Message';
import { TypingIndicator } from '@/components/TypingIndicator';
import { ChatInput } from '@/components/ChatInput';
import { AlertCircle, Settings, Plus, Sun, Moon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const ChatInterface = () => {
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const { messages, isLoading, error, interrupt, sendMessage, sendInterruptAnswer, clearMessages, clearError } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [taskType, setTaskType] = useState<'none' | 'essay' | 'code'>('none');

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('openai-api-key');
    if (savedKey) {
      setApiKey(savedKey);
      setTempApiKey(savedKey);
    }

  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
  setTheme(savedTheme || 'dark');
  }, []);

  // Save API key to localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('openai-api-key', apiKey);
    }
  }, [apiKey]);

  // Apply theme
  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (message: string) => {
    if (!apiKey.trim()) {
      setIsApiDialogOpen(true);
      return;
    }
    await sendMessage(message, apiKey, taskType);
  };

  const handleAnswerInterrupt = async (answer: string) => {
    if (!apiKey.trim()) {
      setIsApiDialogOpen(true);
      return;
    }
    await sendInterruptAnswer(answer);
  };

  const handleThemeToggle = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSaveApiKey = () => {
    setApiKey(tempApiKey);
    setIsApiDialogOpen(false);
  };

  const handleOpenApiDialog = () => {
    setTempApiKey(apiKey);
    setIsApiDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header with title and API key button */}
      <div className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
          <h1 className="text-xl font-medium text-foreground">
            In The Loop
          </h1>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { clearMessages(); setTaskType('none'); }}
              className="bg-secondary border-border text-foreground hover:bg-accent hover:text-accent-foreground"
              title="Start a new chat thread"
            >
              <Plus size={16} className="mr-2" />
              New Chat
            </Button>

            <Dialog open={isApiDialogOpen} onOpenChange={setIsApiDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleOpenApiDialog}
                  className="bg-secondary border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Settings size={16} className="mr-2" />
                  Add API Keys
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-popover border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">OpenAI API Key</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Enter your OpenAI API key to start chatting with the AI.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <input
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="Enter your OpenAI API key (sk-...)"
                    className="w-full bg-background border border-input rounded-lg px-4 py-3 text-foreground 
                             placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring 
                             focus:border-ring"
                  />
                  <p className="text-sm text-muted-foreground">
                    Get your API key from{' '}
                    <a 
                      href="https://platform.openai.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      OpenAI Platform
                    </a>
                  </p>
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsApiDialogOpen(false)}
                      className="bg-secondary border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveApiKey}
                      disabled={!tempApiKey.trim()}
                      className="bg-primary hover:opacity-90 text-primary-foreground disabled:opacity-50"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="sm"
              onClick={handleThemeToggle}
              className="bg-secondary border-border text-foreground hover:bg-accent hover:text-accent-foreground"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? (
                <Sun size={16} />
              ) : (
                <Moon size={16} />
              )}            
              </Button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="border-b border-destructive p-4 bg-destructive/10">
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <AlertCircle size={16} className="text-destructive" />
            <span className="text-sm">
              {error}
            </span>
            <button
              onClick={clearError}
              className="ml-auto text-foreground hover:opacity-80 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-normal text-foreground mb-8">
                What can I help with?
              </h1>
            </div>
            
            <div className="w-full max-w-4xl">
              <ChatInput 
                onSendMessage={handleSendMessage}
                disabled={isLoading}
                apiKey={apiKey}
                onApiKeyChange={setApiKey}
                taskType={taskType}
                onTaskTypeChange={setTaskType}
              />
            </div>
          </div>
        ) : (
          <div className="w-full">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {/* Transient interrupt prompt (not appended to messages) */}
            {interrupt && (
              <div className="max-w-4xl mx-auto px-4 py-2">
                <div className="grid grid-cols-2 gap-4 items-start">
                  {/* Question on the left */}
                  <div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                      <div className="text-foreground mb-3 whitespace-pre-wrap">{interrupt.question}</div>
                      {interrupt.options && (
                        Array.isArray(interrupt.options) ? (
                          interrupt.options.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {interrupt.options.map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => handleAnswerInterrupt(opt)}
                                  className="px-3 py-1.5 rounded-full border border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          )
                        ) : (
                          // options is a record of label -> description
                          Object.keys(interrupt.options as Record<string, string>).length > 0 && (
                            <div className="flex flex-col gap-2">
                              {Object.entries(interrupt.options as Record<string, string>).map(([label, desc]) => (
                                <button
                                  key={label}
                                  onClick={() => handleAnswerInterrupt(label)}
                                  className="text-left px-3 py-2 rounded-lg border border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                                  title={desc}
                                >
                                  <div className="font-medium">{label}</div>
                                  {desc ? (
                                    <div className="text-sm text-muted-foreground">{desc}</div>
                                  ) : null}
                                </button>
                              ))}
                            </div>
                          )
                        )
                      )}
                    </div>
                  </div>
                  {/* Answer input on the right */}
                  <div className="justify-self-end w-full">
                    <div className="max-w-md ml-auto">
                      <InlineAnswer onSubmit={handleAnswerInterrupt} disabled={isLoading} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isLoading && !interrupt && <TypingIndicator />}
            <div ref={messagesEndRef} />
            {/* Add some bottom padding so last message isn't right against input */}
            <div className="h-4"></div>
          </div>
        )}
      </div>
      
      {/* Fixed bottom input - only show when there are messages and not in interrupt-only state */}
      {messages.length > 0 && (
        <div className="border-t border-border bg-background">
          <div className="max-w-4xl mx-auto p-4">
            <ChatInput 
              onSendMessage={handleSendMessage}
              disabled={isLoading}
              apiKey={apiKey}
              onApiKeyChange={setApiKey}
              taskType={taskType}
              onTaskTypeChange={setTaskType}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Inline answer input used for free-form interrupt responses
const InlineAnswer = ({ onSubmit, disabled }: { onSubmit: (answer: string) => void; disabled?: boolean }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 128) + 'px';
    }
  }, [value]);

  const submit = () => {
    if (value.trim() && !disabled) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type your answer…"
  className="flex-1 bg-secondary border border-input rounded-xl px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[32px] max-h-32 overflow-y-auto no-scrollbar"
        rows={1}
      />
      <Button onClick={submit} disabled={disabled || !value.trim()} className="bg-primary hover:opacity-90 text-primary-foreground">
        Submit
      </Button>
    </div>
  );
};
