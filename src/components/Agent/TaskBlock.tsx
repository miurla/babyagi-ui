import { FC } from 'react';
import { Block, AgentMessage } from '@/types';
import { useSkills } from '@/hooks';
import { AgentResult } from './AgentResult';
import { AgentTaskStatus } from './AgentTastStatus';
import { getEmoji } from '@/utils/message';
import Markdown from './Markdown';
import { AgentCollapsible } from './AgentCollapsible';
export interface AgentTaskProps {
  block: Block;
}

const renderIcon = (message: AgentMessage, block: Block) => {
  return message.style === 'log' || block.status === 'complete'
    ? ''
    : message.icon || getEmoji(message.type);
};

const renderContent = (message: AgentMessage) => {
  const title =
    message.status === 'complete'
      ? message.content.split('\n')[0]
      : message.content.trim().split('\n').slice(-1)[0];
  return message.style === 'log' ? (
    <AgentCollapsible title={title} isOpen={false}>
      <div className="prose prose-sm w-full dark:prose-invert prose-pre:bg-neutral-200 prose-pre:text-black dark:prose-pre:bg-neutral-800 dark:prose-pre:text-white">
        <Markdown content={`\`\`\`\n${message.content}\n\`\`\``} />
      </div>
    </AgentCollapsible>
  ) : (
    <div className="prose prose-sm prose-neutral w-full pt-1.5 dark:prose-invert prose-pre:bg-neutral-200 prose-pre:text-black dark:prose-pre:bg-neutral-800 dark:prose-pre:text-white">
      <Markdown content={message.content} />
    </div>
  );
};

export const TaskBlock: FC<AgentTaskProps> = ({ block }) => {
  const message = block.messages[0];
  const title = message.taskId
    ? `${message.taskId}. ${message.title}`
    : message.title;
  const dependentTaskIds = message?.options?.dependentTaskIds ?? '';
  const icon = message.icon || getEmoji(message.type);
  const renderMessages = block.messages.filter(
    (message) => message.content !== '',
  );

  return (
    <div className="relative m-auto flex w-full flex-col gap-4 px-4 py-4 text-base text-neutral-900 dark:text-neutral-300 md:max-w-2xl md:gap-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
      <div className="flex flex-col rounded-lg border border-neutral-200 dark:border-neutral-800">
        <div className="flex gap-4 p-6">
          <div className="flex aspect-square h-9 items-center justify-center rounded-full border border-neutral-200 text-lg dark:border-neutral-800">
            {icon}
          </div>
          <div className="focus:border-1 w-full pt-1.5 text-base font-medium focus:border-purple-500 focus:bg-white">
            {title}
          </div>
          <AgentTaskStatus block={block} />
        </div>
        {renderMessages.length > 0 && (
          <AgentResult
            title="Task Details"
            dependencies={dependentTaskIds}
            isOpen={false}
          >
            {renderMessages.map((message, index) => (
              <div className="flex flex-col gap-4 p-6" key={index}>
                <div className="flex gap-4">
                  <div className="flex aspect-square h-9 items-center justify-center text-lg">
                    {renderIcon(message, block)}
                  </div>
                  <div>{renderContent(message)}</div>
                </div>
              </div>
            ))}
          </AgentResult>
        )}
      </div>
    </div>
  );
};
