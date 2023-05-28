import { AgentType, Execution } from '@/types';
import { EXECUTIONS_KEY } from './constants';

export const updateExecution = (updatedExecution: Execution) => {
  const executions = savedExecutions().map((execution) => {
    if (execution.id === updatedExecution.id) {
      return updatedExecution;
    }

    return execution;
  });
  saveExecutions(executions);

  return executions;
};

export const saveExecution = (execution: Execution) => {
  const executions = [...savedExecutions(), execution];
  saveExecutions(executions);
  return executions;
};

const saveExecutions = (executions: Execution[]) => {
  localStorage.setItem(EXECUTIONS_KEY, JSON.stringify(executions));
};

export const savedExecutions = () => {
  return JSON.parse(
    localStorage.getItem(EXECUTIONS_KEY) || '[]',
  ) as Execution[];
};

export const deleteExecution = (executionId: string) => {
  const executions = savedExecutions().filter(
    (savedExecution) => savedExecution.id !== executionId,
  );
  saveExecutions(executions);
  return executions;
};
