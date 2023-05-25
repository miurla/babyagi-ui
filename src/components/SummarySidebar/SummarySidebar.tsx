import { FC } from 'react';
import { Message } from '@/types';
import { MessageCard } from './MessageCard';

export interface SummarySidebarProps {
  messages: Message[];
}

export const SummarySidebar: FC<SummarySidebarProps> = ({ messages }) => {
  const objective = messages.find((message) => message.type === 'objective');
  const task = messages
    .reverse()
    .find((message) => message.type === 'next-task');
  const taskList = messages
    .reverse()
    .find((message) => message.type === 'task-list');
  const list = [objective, task, taskList].filter(
    (message) => message !== undefined,
  );

  return (
    <div className="h-full w-[480px] overflow-scroll bg-neutral-100 p-4 text-sm text-black dark:bg-neutral-800 dark:text-white">
      <div className="flex flex-col gap-3">
        {messages.length > 0 ? (
          list.map(
            (message) =>
              message && <MessageCard key={message.type} message={message} />,
          )
        ) : (
          <div>Nothing to show</div>
        )}
      </div>
    </div>
  );
};
