import { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { Send, Plus, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSendMessage: (message: string, taskType?: 'none' | 'essay' | 'code') => void;
  disabled?: boolean;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  taskType?: 'none' | 'essay' | 'code';
  onTaskTypeChange?: (t: 'none' | 'essay' | 'code') => void;
}

export const ChatInput = ({ onSendMessage, disabled = false, apiKey, onApiKeyChange, taskType = 'none', onTaskTypeChange }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleSubmit = () => {
    if (message.trim() && !disabled && apiKey) {
      onSendMessage(message, taskType);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const label = taskType === 'essay' ? 'Essay' : taskType === 'code' ? 'Code' : 'None';

  return (
    <div className="relative">
      <div className="bg-secondary border border-border rounded-3xl p-4">
        <div className="flex items-center gap-3">
          <button 
            className="p-2 text-muted-foreground hover:text-primary transition-colors"
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
              className="w-full bg-transparent text-foreground placeholder-muted-foreground resize-none 
                       focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed min-h-[24px] max-h-32 overflow-y-auto no-scrollbar"
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

          
          {/* Task type custom dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              className={`flex items-center gap-2 rounded-3xl px-4 py-2 border text-sm transition-colors
                         ${open ? 'border-ring' : 'border-border'} bg-secondary text-foreground
                         hover:border-input focus:outline-none focus:ring-2 focus:ring-ring`}
              title="Select task type"
            >
              <span>{label}</span>
              <ChevronDown size={16} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <div
                role="menu"
                aria-label="Task type"
                className="absolute z-20 mt-2 w-44 rounded-2xl border border-border bg-secondary shadow-xl overflow-hidden"
              >
                {(['none', 'essay', 'code'] as const).map((opt) => (
                  <button
                    key={opt}
                    role="menuitemradio"
                    aria-checked={taskType === opt}
                    onClick={() => { onTaskTypeChange?.(opt); setOpen(false); }}
                    className={`w-full flex items-center justify-between text-left px-4 py-2 text-sm transition-colors
                               ${taskType === opt ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent hover:text-accent-foreground'}`}
                  >
                    <span>{opt === 'none' ? 'None' : opt === 'essay' ? 'Essay' : 'Code'}</span>
                    {taskType === opt && <Check size={16} className="text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {message.trim() && apiKey && (
            <button
              onClick={handleSubmit}
              disabled={disabled}
              className="p-2 bg-primary text-primary-foreground rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Send size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
