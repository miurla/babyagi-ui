import { Message } from '@/types';
import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface MessageCardProps {
  message?: Message;
}

export const MessageCard: FC<MessageCardProps> = ({ message }) => {
  return (
    <div className="flex h-full flex-col gap-0.5 bg-neutral-100 text-sm text-black dark:bg-neutral-800 dark:text-white">
      <label className="inline-flex items-center gap-2 text-neutral-400">
        <span className="text-lg">{message?.icon}</span>
        {message?.type}
      </label>
      <div className="prose rounded bg-neutral-900 p-2 dark:prose-invert prose-pre:bg-neutral-200 prose-pre:text-black dark:prose-pre:bg-neutral-800 dark:prose-pre:text-white">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message?.text ?? ''}
        </ReactMarkdown>
      </div>
    </div>
  );
};
