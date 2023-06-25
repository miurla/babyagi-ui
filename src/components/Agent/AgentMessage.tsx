import { Message } from '@/types';
import { getMessageText } from '@/utils/message';
import { UpdateIcon } from '@radix-ui/react-icons';
import { FC, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { translate } from '../../utils/translate';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneLight,
  vscDarkPlus,
} from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { AgentCollapsible } from './AgentCollapsible';
import { useTheme } from 'next-themes';

interface AgentMessageProps {
  message: Message;
  spacing?: 'normal' | 'tight';
}

const AgentMessage: FC<AgentMessageProps> = ({
  message,
  spacing = 'normal',
}) => {
  const simpleTitle = message.title?.split('(')[0] ?? ''; // ex: 'Creating tasks... (*This process takes time. Please wait...*)'
  const { theme, systemTheme } = useTheme();
  const [highlightStyle, setHighlightStyle] = useState(oneLight);
  const py = spacing === 'normal' ? 'py-4 md:py-6' : 'py-0';

  useEffect(() => {
    const isDark =
      theme === 'system' ? systemTheme === 'dark' : theme === 'dark';
    const style = isDark ? vscDarkPlus : oneLight;
    setHighlightStyle(style);
  }, [theme, systemTheme]);

  const contents = (
    <div className="prose dark:prose-invert prose-pre:bg-neutral-200 prose-pre:text-black dark:prose-pre:bg-neutral-800 dark:prose-pre:text-white">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, style, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                language={match[1]}
                style={highlightStyle}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {getMessageText(message)}
      </ReactMarkdown>
    </div>
  );

  return (
    <div
      className={`text-gray-800 dark:border-gray-900/50 dark:text-gray-100 ${
        message.type === 'loading' ? 'bg-neutral-50 dark:bg-neutral-950' : ''
      }`}
    >
      <div
        className={`relative m-auto flex gap-4 px-4 text-base md:max-w-2xl md:gap-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl ${py}`}
      >
        {message.type === 'loading' ? (
          <div className="w-10 pt-1.5">
            <UpdateIcon className="animate-spin" />
          </div>
        ) : message.type === 'task-execute' ? (
          <div className="w-12"></div>
        ) : (
          <div className="w-10 pt-0.5 text-xl">{message.icon}</div>
        )}
        {message.type === 'session-summary' ? (
          <details>
            <summary className="pt-0.5 text-lg font-bold">
              {translate('SUMMARY')}
            </summary>
            {contents}
          </details>
        ) : message.status?.type === 'creating-stream' ||
          message.status?.type === 'executing-stream' ||
          message.type === 'search-logs' ||
          message.type === 'task-execute' ? (
          <AgentCollapsible title={simpleTitle} isOpen={message.open}>
            {contents}
          </AgentCollapsible>
        ) : (
          contents
        )}
      </div>
    </div>
  );
};

export default AgentMessage;
