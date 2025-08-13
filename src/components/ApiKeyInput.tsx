import { useState } from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const ApiKeyInput = ({ apiKey, onApiKeyChange }: ApiKeyInputProps) => {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-yellow-50 dark:bg-yellow-900/20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <Key size={16} className="text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            OpenAI API Key Required
          </span>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="Enter your OpenAI API key (sk-...)"
              className="w-full p-2 pr-10 border border-yellow-300 dark:border-yellow-600 rounded
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-yellow-500 focus:border-transparent
                         text-sm"
            />
            
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 
                         text-gray-500 hover:text-gray-700 dark:text-gray-400 
                         dark:hover:text-gray-200"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        
        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
          Your API key is stored locally and never sent to our servers. 
          Get your key from{' '}
          <a 
            href="https://platform.openai.com/api-keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            OpenAI Platform
          </a>
        </p>
      </div>
    </div>
  );
};
