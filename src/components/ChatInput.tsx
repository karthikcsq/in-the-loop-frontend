import { useState, KeyboardEvent } from 'react';
import { Send, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const ChatInput = ({ onSendMessage, disabled = false, apiKey, onApiKeyChange }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (message.trim() && !disabled && apiKey) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      <div className="bg-gray-900 border border-gray-700 rounded-3xl p-4">
        <div className="flex items-center gap-3">
          <button 
            className="p-2 text-gray-400 hover:text-teal-400 transition-colors"
            onClick={() => {/* Future: file upload */}}
          >
            <Plus size={20} />
          </button>
          
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={apiKey ? "Ask anything" : "Add API key to start chatting"}
              disabled={disabled}
              className="w-full bg-transparent text-white placeholder-gray-400 resize-none 
                       focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
                       min-h-[24px] max-h-32"
              rows={1}
              style={{
                height: 'auto',
                minHeight: '24px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 128) + 'px';
              }}
            />
          </div>
          
          {message.trim() && apiKey && (
            <button
              onClick={handleSubmit}
              disabled={disabled}
              className="p-2 bg-gradient-to-r from-teal-500 to-cyan-400 text-black rounded-full 
                       hover:from-teal-400 hover:to-cyan-300 transition-all duration-200
                       disabled:from-gray-600 disabled:to-gray-500 disabled:text-gray-400 
                       disabled:cursor-not-allowed shadow-lg shadow-teal-500/25"
            >
              <Send size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
