import { FC } from 'react';
import { ExecutionRow } from './ExecutionRow';
import { useExecution } from '@/hooks/useExecution';

export const Executions: FC = () => {
  const { executions } = useExecution();
  const exe = executions.slice().reverse();

  return (
    <div className="flex w-full flex-grow flex-col gap-1 overflow-auto pt-2">
      <ul className="flex flex-col gap-1">
        {exe.map((execution) => (
          <ExecutionRow execution={execution} key={execution.id} />
        ))}
      </ul>
    </div>
  );
};
