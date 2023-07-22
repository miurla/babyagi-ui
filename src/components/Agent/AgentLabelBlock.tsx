import { MessageBlock } from '@/types';
import { translate } from '@/utils/translate';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import remarkGfm from 'remark-gfm';
import AgentMessage from './AgentMessage';
import { useEffect, useRef } from 'react';

export interface AgentLabelBlockProps {
  block: MessageBlock;
}

export const AgentLabelBlock: React.FC<AgentLabelBlockProps> = ({ block }) => {
  const message = block.messages[0];
  const nextMessage = block.messages?.[1];
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (message.type === 'final-result') {
      if (!nextMessage) return;

      const file = new Blob(['\uFEFF' + nextMessage?.text], {
        type: 'text/plain;charset=utf-8',
      });
      const url = URL.createObjectURL(file);
      if (linkRef.current) {
        const link = linkRef.current;
        link.href = url;
        link.download = 'session_summary.txt';
      }

      // If it's a development environment, save the file automatically.
      if (process.env.NODE_ENV === 'development') {
        fetch('/api/local/save-session-summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: nextMessage.text }),
        })
          .then((response) => response.json())
          .then((data) => console.log(data));
      }
    }
  }, [nextMessage]);

  if (
    message.type !== 'objective' &&
    message.type !== 'complete' &&
    message.type !== 'final-result' &&
    message.type !== 'task-list' &&
    message.type !== 'task-execute'
  )
    return null;

  if (message.type === 'task-execute') {
    return <AgentMessage message={message} spacing="tight" />;
  }

  return (
    <div className="relative m-auto flex w-full flex-col gap-4 p-6 px-4 text-base text-neutral-900 md:max-w-2xl md:gap-6 md:p-8 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
      <div className="flex flex-col">
        <div className="flex gap-4 px-6">
          <div className="flex aspect-square h-9 items-center justify-center border-neutral-200 text-lg">
            {message.icon}
          </div>
          <div className="focus:border-1 prose prose-neutral w-full dark:prose-invert prose-pre:bg-neutral-200 prose-pre:text-black dark:prose-pre:bg-neutral-800 dark:prose-pre:text-white">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {`### ${message.title}\n${message.text}`}
            </ReactMarkdown>
            {message.type === 'final-result' && (
              <a ref={linkRef} download>
                ⬇️ {translate('DOWNLOAD_SESSION_SUMMARY', 'message')}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
