import { MessageSquare, Trash2, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onClearMessages: () => void;
  hasMessages: boolean;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export const Header = ({ onClearMessages, hasMessages, theme, onThemeToggle }: HeaderProps) => {
  return (
    <div className="border-b border-gray-700 p-4 bg-gray-800">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <MessageSquare size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-100">
              InTheLoop
            </h1>
            <p className="text-sm text-gray-400">
              Powered by OpenAI API
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={onThemeToggle}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-200 hover:bg-gray-700"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </Button>
          
          {hasMessages && (
            <Button
              onClick={onClearMessages}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-400 hover:bg-gray-700"
              title="Clear conversation"
            >
              <Trash2 size={20} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
