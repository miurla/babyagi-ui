import { MessageBlock } from '@/types';
import { CheckCircledIcon, CircleIcon } from '@radix-ui/react-icons';

export interface AgentTaskStatusProps {
  block: MessageBlock;
}

export const AgentTaskStatus: React.FC<AgentTaskStatusProps> = ({ block }) => {
  return (
    <div className="flex aspect-square h-9 items-center justify-center">
      {block.status === 'complete' ? (
        <CheckCircledIcon className="h-5 w-5 text-teal-500 dark:text-green-500" />
      ) : block.status === 'incomplete' ? (
        <CircleIcon className="h-5 w-5 text-neutral-300 dark:text-neutral-500" />
      ) : (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-transparent dark:border-neutral-500 dark:border-t-black" />
      )}
    </div>
  );
};
