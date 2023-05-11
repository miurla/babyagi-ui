import { createContext, useContext, useState, useEffect } from 'react';
import { Execution } from '@/types';
import {
  saveExecution,
  savedExecutions,
  updateExecution,
} from '@/utils/execution';

type ExecutionContextType = {
  executions: Execution[];
  selectedExecutionId: string | undefined;
  addExecution: (execution: Execution) => void;
  updateExec: (updatedExecution: Execution) => void;
  selectExecution: (executionId?: string) => void;
};

const ExecutionContext = createContext<ExecutionContextType>({
  executions: [],
  selectedExecutionId: undefined,
  addExecution: () => {},
  updateExec: () => {},
  selectExecution: () => {},
});

export const useExecution = () => {
  return useContext(ExecutionContext);
};

interface ExecutionProviderProps {
  children: React.ReactNode;
}

export const ExecutionProvider: React.FC<ExecutionProviderProps> = ({
  children,
}) => {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [selectedExecutionId, setSelectedExecutionId] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    const savedExes = savedExecutions();
    setExecutions(savedExes);
  }, []);

  const addExecution = (execution: Execution) => {
    const updatedExecutions = saveExecution(execution);
    setExecutions(updatedExecutions);
  };

  const updateExec = (updatedExecution: Execution) => {
    const updatedExecutions = updateExecution(updatedExecution);
    setExecutions(updatedExecutions);
  };

  const selectExecution = (executionId?: string) => {
    setSelectedExecutionId(executionId);
  };

  return (
    <ExecutionContext.Provider
      value={{
        executions,
        selectedExecutionId,
        addExecution,
        updateExec,
        selectExecution,
      }}
    >
      {children}
    </ExecutionContext.Provider>
  );
};
