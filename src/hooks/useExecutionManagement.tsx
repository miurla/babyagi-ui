// src/hooks/useExecutionManagement.ts
import { v4 as uuidv4 } from 'uuid';
import { useExecution } from '@/hooks/useExecution';
import { AgentType, SelectItem } from '@/types';
import { AgentMessage } from '../types';

export const useExecutionManagement = () => {
  const {
    addExecution,
    updateExec,
    executions,
    selectedExecutionId,
    selectExecution,
  } = useExecution();

  const saveNewData = async (
    input: string,
    model: SelectItem,
    iterations: SelectItem,
    firstTask: string,
    selectedAgent: SelectItem,
    agentMessages: AgentMessage[],
  ) => {
    const execution = {
      id: uuidv4(),
      name: input,
      date: new Date().toISOString(),
      params: {
        objective: input,
        model: model,
        iterations: iterations,
        firstTask: firstTask,
        agent: selectedAgent.id as AgentType,
      },
      messages: undefined,
      agentMessages: agentMessages,
    };

    selectExecution(execution.id);
    await new Promise((resolve) => {
      addExecution(execution);
      resolve(null);
    });

    return execution;
  };

  return {
    saveNewData,
    updateExec,
    executions,
    selectedExecutionId,
    selectExecution,
  };
};
