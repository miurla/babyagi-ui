import { createContext, useContext, useState } from 'react';

type ExecutionStatusContextType = {
  isExecuting: boolean;
  setExecuting: (isExecuting: boolean) => void;
};

const ExecutionStatusContext = createContext<ExecutionStatusContextType>({
  isExecuting: false,
  setExecuting: () => {},
});

export const useExecutionStatus = () => {
  return useContext(ExecutionStatusContext);
};

interface ExecutionStatusProviderProps {
  children: React.ReactNode;
}

export const ExecutionStatusProvider: React.FC<
  ExecutionStatusProviderProps
> = ({ children }) => {
  const [isExecuting, setExecuting] = useState<boolean>(false);

  return (
    <ExecutionStatusContext.Provider value={{ isExecuting, setExecuting }}>
      {children}
    </ExecutionStatusContext.Provider>
  );
};
