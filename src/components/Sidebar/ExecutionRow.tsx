import { useExecution } from '@/hooks/useExecution';
import { useExecutionStatus } from '@/hooks/useExecutionStatus';
import { Execution } from '@/types';
import { iconFromExecutionType } from '@/utils/execution';
import { FC } from 'react';

interface ExecutionRowProps {
  execution: Execution;
}

export const ExecutionRow: FC<ExecutionRowProps> = ({ execution }) => {
  const { selectExecution, selectedExecutionId } = useExecution();
  const { isExecuting } = useExecutionStatus();

  const handleSelectExecution = (executionId: string) => {
    selectExecution(executionId);
  };

  return (
    <button
      className={`flex w-full items-center gap-3 rounded-lg p-3 text-sm transition-colors duration-200 hover:bg-neutral-500/10 disabled:opacity-50 disabled:hover:bg-inherit 
       ${
         execution.id === selectedExecutionId &&
         !isExecuting &&
         'bg-neutral-300/10'
       }
      `}
      onClick={() => handleSelectExecution(execution.id)}
      disabled={isExecuting}
    >
      <span className="pr-1">
        {iconFromExecutionType(execution.params.agent)}
      </span>
      <span className="truncate">{execution.name}</span>
    </button>
  );
};
