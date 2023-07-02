import { MessageBlock } from '@/types';
import { FC } from 'react';
import AgentMessage from './AgentMessage';
import { AgentMessageInput } from './AgentMessageInput';

export interface AgentMessageBlockProps {
  block: MessageBlock;
  userInputCallback: (id: number, input: string) => Promise<void>;
}

export const AgentMessageBlock: FC<AgentMessageBlockProps> = ({
  block,
  userInputCallback,
}) => {
  return (
    <div className="flex w-full flex-col gap-8 border-b border-white/10  bg-neutral-50 p-6 dark:bg-transparent md:p-8">
      {block.messages.map((message, index) =>
        message.type === `user-input` ? (
          <AgentMessageInput
            key={index}
            id={block.id ?? 0}
            message={message}
            onSubmit={userInputCallback}
          />
        ) : (
          <AgentMessage message={message} key={index} spacing="tight" />
        ),
      )}
    </div>
  );
};
