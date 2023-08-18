import { Block } from '@/types';
import { FC } from 'react';
import { LabelBlock } from './LabelBlock';
import { TaskBlock } from './TaskBlock';

export interface AgentBlockProps {
  block: Block;
}

export const AgentBlock: FC<AgentBlockProps> = ({ block }) => {
  return (
    <div className="flex w-full flex-col p-2">
      {block.style === 'label' ? (
        <LabelBlock block={block} />
      ) : (
        <TaskBlock block={block} />
      )}
    </div>
  );
};
