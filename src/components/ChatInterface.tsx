'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { Message } from '@/components/Message';
import { TypingIndicator } from '@/components/TypingIndicator';
import { ChatInput } from '@/components/ChatInput';
import { AlertCircle, Key, Settings } from 'lucide-react';
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const { messages, isLoading, error, sendMessage, clearMessages, clearError } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('openai-api-key');
    if (savedKey) {
      setApiKey(savedKey);
      setTempApiKey(savedKey);
    }

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    }
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
    await sendMessage(message, apiKey);
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
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header with title and API key button */}
      <div className="bg-black border-b border-gray-800">
        <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
          <h1 className="text-xl font-medium text-white">
            In The Loop
          </h1>
          
          <Dialog open={isApiDialogOpen} onOpenChange={setIsApiDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleOpenApiDialog}
                className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800 hover:text-white"
              >
                <Settings size={16} className="mr-2" />
                Add API Keys
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">OpenAI API Key</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Enter your OpenAI API key to start chatting with the AI.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="Enter your OpenAI API key (sk-...)"
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white 
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 
                           focus:border-teal-400"
                />
                <p className="text-sm text-gray-400">
                  Get your API key from{' '}
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-teal-400 hover:text-teal-300 hover:underline"
                  >
                    OpenAI Platform
                  </a>
                </p>
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsApiDialogOpen(false)}
                    className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveApiKey}
                    disabled={!tempApiKey.trim()}
                    className="bg-teal-600 hover:bg-teal-700 text-white disabled:bg-gray-600"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {error && (
        <div className="border-b border-red-800 p-4 bg-red-900/20">
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-sm text-red-200">
              {error}
            </span>
            <button
              onClick={clearError}
              className="ml-auto text-red-400 hover:text-red-200 text-sm underline"
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
              <h1 className="text-3xl font-normal text-white mb-8">
                What can I help with?
              </h1>
            </div>
            
            <div className="w-full max-w-4xl">
              <ChatInput 
                onSendMessage={handleSendMessage}
                disabled={isLoading}
                apiKey={apiKey}
                onApiKeyChange={setApiKey}
              />
            </div>
          </div>
        ) : (
          <div className="w-full">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
            {/* Add some bottom padding so last message isn't right against input */}
            <div className="h-4"></div>
          </div>
        )}
      </div>
      
      {/* Fixed bottom input - only show when there are messages */}
      {messages.length > 0 && (
        <div className="border-t border-gray-800 bg-black">
          <div className="max-w-4xl mx-auto p-4">
            <ChatInput 
              onSendMessage={handleSendMessage}
              disabled={isLoading}
              apiKey={apiKey}
              onApiKeyChange={setApiKey}
            />
          </div>
        </div>
      )}
    </div>
  );
};
