import { MessageBlock } from '@/types';
import { FC } from 'react';
import AgentMessage from './AgentMessage';
import { AgentMessageInput } from './AgentMessageInput';

export interface AgentMessageBlockProps {
  block: MessageBlock;
  userInputCallback: (input: string) => Promise<void>;
}

export const AgentMessageBlock: FC<AgentMessageBlockProps> = ({
  block,
  userInputCallback,
}) => {
  return (
    <div className="w-full border-b border-black/10">
      {block.messages.map((message, index) =>
        message.type === `task-output` ? (
          <AgentMessageInput
            key={index}
            message={message}
            onSubmit={userInputCallback}
          />
        ) : (
          <AgentMessage message={message} key={index} />
        ),
      )}
    </div>
  );
};
