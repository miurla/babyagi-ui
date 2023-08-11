import { useEffect, useRef } from 'react';
import { Block } from '@/types';
import { getEmoji, getTitle } from '@/utils/message';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import remarkGfm from 'remark-gfm';
import { translate } from '@/utils/translate';

export interface LabelBlockProps {
  block: Block;
}

export const LabelBlock: React.FC<LabelBlockProps> = ({ block }) => {
  const { icon, type, style, title, content } = block.messages[0];
  const emoji = icon || getEmoji(type);
  const blockTitle = title || getTitle(type);
  const blockContent = style === 'log' ? '```\n' + content + '\n```' : content;
  const sessionSummary =
    block.messages[0].type === 'session-summary'
      ? block.messages[0].content
      : null;

  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (sessionSummary) {
      const file = new Blob(['\uFEFF' + sessionSummary], {
        type: 'text/plain;charset=utf-8',
      });
      const url = URL.createObjectURL(file);
      if (linkRef.current) {
        const link = linkRef.current;
        link.href = url;
        link.download = 'session_summary.txt';
      }
    }
  }, [sessionSummary]);

  const renderEmoji = () => (
    <div className="flex aspect-square h-9 items-center justify-center border-neutral-200 text-lg">
      {emoji}
    </div>
  );

  const renderContent = () => (
    <div className="focus:border-1 prose prose-neutral w-full dark:prose-invert prose-pre:bg-neutral-200 prose-pre:text-black dark:prose-pre:bg-neutral-800 dark:prose-pre:text-white">
      {sessionSummary ? (
        <>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {`### ${blockTitle}\n`}
          </ReactMarkdown>
          <a ref={linkRef} download>
            ⬇️ {translate('DOWNLOAD_SESSION_SUMMARY', 'message')}
          </a>
        </>
      ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {`### ${blockTitle}\n${blockContent}`}
        </ReactMarkdown>
      )}
    </div>
  );

  return (
    <div className="relative m-auto flex w-full flex-col gap-4 p-6 px-4 text-base text-neutral-900 md:max-w-2xl md:gap-6 md:p-8 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
      <div className="flex flex-col">
        <div className="flex gap-4 px-6">
          {renderEmoji()}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
