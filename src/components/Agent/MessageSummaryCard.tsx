import * as HoverCard from '@radix-ui/react-hover-card';
import { FC } from 'react';
import { Message } from '@/types';
import { MessageSummary } from './MessageSummary';
import { DrawingPinFilledIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import clsx from 'clsx';

export interface MessageSummaryCardProps {
  messages: Message[];
}

export const MessageSummaryCard: FC<MessageSummaryCardProps> = ({
  messages,
}) => {
  const objective = messages.find((message) => message.type === 'objective');
  const task = messages
    .slice()
    .reverse()
    .find((message) => message.type === 'next-task');
  const taskList = messages
    .slice()
    .reverse()
    .find((message) => message.type === 'task-list');
  const list = [objective, task, taskList].filter(
    (message) => message !== undefined,
  );

  const content = (
    <div className="max-h-[calc(100vh-120px)] w-[480px] overflow-scroll bg-neutral-50 p-4 text-sm text-black dark:bg-neutral-800 dark:text-white">
      <div className="flex flex-col gap-3">
        {messages.length > 0 ? (
          list.map(
            (message) =>
              message && (
                <MessageSummary key={message.type} message={message} />
              ),
          )
        ) : (
          <div>Nothing to show</div>
        )}
      </div>
    </div>
  );

  return (
    <HoverCard.Root openDelay={300}>
      <HoverCard.Trigger>
        <div
          className={clsx(
            'inline-flex cursor-pointer items-center justify-center rounded-full bg-neutral-100 p-2 shadow dark:bg-neutral-800',
          )}
        >
          <DrawingPinFilledIcon
            className={clsx(
              'h-4 w-4',
              'text-neutral-400 dark:text-neutral-600',
            )}
          />
        </div>
      </HoverCard.Trigger>
      <HoverCard.Content
        align="end"
        sideOffset={8}
        className={clsx(
          'z-30 rounded p-2 shadow',
          'bg-neutral-100 dark:bg-neutral-800',
        )}
      >
        <HoverCard.Arrow className="fill-current text-neutral-50 dark:text-neutral-800" />
        {content}
      </HoverCard.Content>
    </HoverCard.Root>
  );
};
