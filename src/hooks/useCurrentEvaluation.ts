import { Execution } from '@/types';

export const useCurrentEvaluation = (
  executions: Execution[],
  selectedExecutionId: string | undefined,
) => {
  const currentEvaluation = () => {
    const selectedExecution = executions.find(
      (exe) => exe.id === selectedExecutionId,
    );
    if (selectedExecution) {
      return selectedExecution.evaluation;
    }
    return undefined;
  };

  return { currentEvaluation };
};
