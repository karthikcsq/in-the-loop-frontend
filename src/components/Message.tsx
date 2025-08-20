import { Message as MessageType } from '@/types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageProps {
  message: MessageType;
}

export const Message = ({ message }: MessageProps) => {
  const isUser = message.role === 'user';

  if (isUser) {
    // User messages: Dark bubble on the right, with left margin
    return (
      <div className="max-w-4xl mx-auto px-4 py-2">
        <div className="flex justify-end ml-[25%]">
          <div className="bg-secondary text-secondary-foreground rounded-3xl px-5 py-3 max-w-full">
            <div className="whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    // AI messages: Full width text, no right margin, with separator line
    return (
      <div className="max-w-4xl mx-auto">
        {/* Separator line */}
        <div className="border-t border-border mx-4 my-4"></div>
        <div className="px-4 py-3">
          <div className="text-foreground/90 leading-relaxed">
            <div className="prose prose-invert dark:prose-invert max-w-none prose-pre:bg-secondary prose-pre:text-foreground prose-code:before:content-[''] prose-code:after:content-['']">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
