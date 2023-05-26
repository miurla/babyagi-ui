import { Message } from '@/types';
import { getMessageSummaryTitle } from '@/utils/message';
import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface MessageSummaryProps {
  message?: Message;
}

export const MessageSummary: FC<MessageSummaryProps> = ({ message }) => {
  return (
    <div className="flex h-full flex-col gap-1 text-sm text-black dark:bg-neutral-800 dark:text-white">
      <label className="inline-flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
        <span className="text-lg">{message?.icon}</span>
        {getMessageSummaryTitle(message)}
      </label>
      <div className="prose ml-6 rounded bg-neutral-100 px-2 py-1 dark:prose-invert prose-pre:bg-neutral-200 prose-pre:text-black dark:bg-neutral-900 dark:prose-pre:bg-neutral-800 dark:prose-pre:text-white">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message?.text ?? ''}
        </ReactMarkdown>
      </div>
    </div>
  );
};
