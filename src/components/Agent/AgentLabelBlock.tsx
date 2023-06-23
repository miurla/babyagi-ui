import { MessageBlock } from '@/types';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

export interface AgentLabelBlockProps {
  block: MessageBlock;
}

export const AgentLabelBlock: React.FC<AgentLabelBlockProps> = ({ block }) => {
  const message = block.messages[0];
  if (message.type !== 'objective' && message.type !== 'complete') return null;

  return (
    <div className="relative m-auto flex w-full flex-col gap-4 bg-white p-6 px-4 text-base text-neutral-900 dark:bg-[#444654] md:max-w-2xl md:gap-6 md:p-8 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
      <div className="flex flex-col">
        <div className="flex gap-4 px-6">
          <div className="flex aspect-square h-9 items-center justify-center border-neutral-200 text-lg">
            {message.icon}
          </div>
          <div className="focus:border-1 prose prose-neutral w-full pt-1.5">
            <ReactMarkdown>{`### ${message.title}\n${message.text}`}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};
