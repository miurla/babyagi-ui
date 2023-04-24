import { AgentMessage } from '@/types';
import { UpdateIcon } from '@radix-ui/react-icons';
import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import 'tailwindcss/tailwind.css';

interface AgentMessageProps {
  message: AgentMessage;
}

const AgentMessage: FC<AgentMessageProps> = ({ message }) => {
  const bgStyle =
    message.type === 'loading'
      ? 'bg-gray-100 dark:bg-neutral-800'
      : message.type === 'objective' || message.type === 'task-result'
      ? 'bg-white dark:bg-black'
      : 'bg-gray-50 dark:bg-[#444654]';

  return (
    <div
      className={
        'border-b border-black/10 text-gray-800 dark:border-gray-900/50 dark:text-gray-100 ' +
        bgStyle
      }
    >
      <div className="relative m-auto flex gap-4 p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
        {message.type === 'loading' ? (
          <div className="w-10 pt-1.5">
            <UpdateIcon className="animate-spin" />
          </div>
        ) : (
          <div className="w-10 text-xl">{message.icon}</div>
        )}
        <div className="prose dark:prose-invert">
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default AgentMessage;
