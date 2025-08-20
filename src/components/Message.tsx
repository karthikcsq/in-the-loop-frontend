"use client";

import { Message as MessageType } from '@/types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type React from 'react';
// Explicitly type the code renderer props to include the `inline` flag used by react-markdown
type CodeProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  inline?: boolean;
  children?: React.ReactNode;
};
type CodeComponent = React.FC<CodeProps>;
// Pre component for block code fences; this avoids returning a <div> from `code`
type PreProps = React.ComponentProps<'pre'> & { dark?: boolean };
const PreBlock: React.FC<PreProps> = ({ children, dark }) => {
  // Children is typically a single <code> element
  const child = Array.isArray(children) ? children[0] : children;
  const codeEl = child as React.ReactElement<any> | undefined;
  const className: string = (codeEl?.props?.className as string) || '';
  const match = /language-(\w+)/.exec(className);
  const lang = match?.[1] || 'text';
  const codeChildren = codeEl?.props?.children;
  const codeText = Array.isArray(codeChildren)
    ? codeChildren.map((c: any) => (typeof c === 'string' ? c : '')).join('')
    : typeof codeChildren === 'string'
    ? codeChildren
    : '';

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-border not-prose">
      <div className="flex items-center justify-between px-3 py-1.5 bg-secondary text-xs text-muted-foreground">
        <span className="uppercase tracking-wide">{lang}</span>
        {/* Copy button will read from extracted code */}
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(codeText.replace(/\n$/, ''));
            } catch {}
          }}
          className="hover:opacity-80"
        >
          Copy
        </button>
      </div>
      <SyntaxHighlighter
        language={lang}
        style={dark ? (oneDark as any) : (oneLight as any)}
        PreTag="div"
        customStyle={{ margin: 0, padding: '12px' }}
        codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
      >
        {codeText.replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
};

interface MessageProps {
  message: MessageType;
}

export const Message = ({ message }: MessageProps) => {
  const isUser = message.role === 'user';
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains('dark'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

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
    const codeRenderer: CodeComponent = ({ inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const lang = match?.[1] || 'text';
      const code = String(children).replace(/\n$/, '');
      if (inline) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
      // For block code, let the custom `pre` component handle rendering
      return <code className={className} {...props}>{children}</code>;
    };
    return (
      <div className="max-w-4xl mx-auto">
        {/* Separator line */}
        <div className="border-t border-border mx-4 my-4"></div>
        <div className="px-4 py-3">
          <div className="text-foreground/90 leading-relaxed">
            <div className="prose prose-invert dark:prose-invert max-w-none prose-code:before:content-[''] prose-code:after:content-['']">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  pre: (props) => <PreBlock {...props} dark={isDark} />,
                  code: codeRenderer,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
