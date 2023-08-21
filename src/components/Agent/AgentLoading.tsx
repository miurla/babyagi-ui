import { UpdateIcon } from '@radix-ui/react-icons';
import { FC } from 'react';

interface AgentLoadingProps {
  message: string;
}

const AgentLoading: FC<AgentLoadingProps> = ({ message }) => {
  return (
    <div
      className={`bg-neutral-50 text-gray-800 dark:border-gray-900/50 dark:bg-neutral-950 dark:text-gray-100`}
    >
      <div
        className={`relative m-auto my-8 flex gap-4 p-4 text-base md:max-w-2xl md:gap-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl`}
      >
        <div className="w-10 pl-8 pr-4 pt-1.5">
          <UpdateIcon className="animate-spin" />
        </div>
        <div>{message}</div>
      </div>
    </div>
  );
};

export default AgentLoading;
