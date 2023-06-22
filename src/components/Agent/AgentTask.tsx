import { MessageBlock } from '@/types';
import { FC } from 'react';
import {
  CheckCircledIcon,
  ChevronRightIcon,
  Link1Icon,
} from '@radix-ui/react-icons';
import { AgentCollapsible } from './AgentCollapsible';
import { AgentResult } from './AgentResult';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

export interface AgentTaskProps {
  block: MessageBlock;
  userInputCallback: (input: string) => Promise<void>;
}

export const AgentTask: FC<AgentTaskProps> = ({ block, userInputCallback }) => {
  const message = block.messages[0];
  // task outpu
  const outputMessage = block.messages.filter(
    (message) => message.type === 'task-output',
  )[0];
  const logs = block.messages.filter(
    (message) => message.type === 'search-logs',
  );

  const handleTextChange = async (e: React.FocusEvent<HTMLDivElement>) => {
    const text = e.target.textContent;
    if (text) {
      await userInputCallback(text);
    }
  };

  return block.id != null && block?.id > 0 ? (
    <div className="relative m-auto flex w-full flex-col gap-4 bg-white p-6 px-4 text-base text-neutral-900 dark:bg-[#444654] md:max-w-2xl md:gap-6 md:p-8 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
      <div className="flex flex-col rounded-lg border border-neutral-200">
        <div className="flex gap-4 p-6">
          <div className="flex aspect-square h-9 items-center justify-center rounded-full border border-neutral-200 text-lg">
            {message.icon}
          </div>
          <div
            className="focus:border-1 w-full pt-1.5 text-base font-medium focus:border-purple-500 focus:bg-white"
            contentEditable
            onBlur={handleTextChange}
          >
            {message.text}
          </div>
          <div className="flex aspect-square h-9 items-center justify-center">
            <CheckCircledIcon className="h-5 w-5 text-teal-500" />
          </div>
        </div>
        <AgentResult title="Task Details" isOpen={false}>
          <div className="flex flex-col gap-4 p-6">
            <div className="flex gap-4">
              <div className="flex aspect-square h-9 items-center justify-center text-lg">
                ✅
              </div>
              <div className="flex flex-col gap-8">
                <div className="prose prose-sm prose-neutral w-full pt-1.5">
                  <ReactMarkdown>{outputMessage?.text}</ReactMarkdown>
                </div>
                {logs.length > 0 && (
                  <AgentCollapsible title="🔎 Search Logs" isOpen={false}>
                    <div className="prose prose-sm w-full">
                      <ReactMarkdown>{logs[0].text}</ReactMarkdown>
                    </div>
                  </AgentCollapsible>
                )}
              </div>
            </div>
          </div>
        </AgentResult>
      </div>
    </div>
  ) : null;
};
