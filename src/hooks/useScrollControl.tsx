// src/hooks/useScrollControl.ts
import { useCallback } from 'react';

export const useScrollControl = (
  messagesEndRef: React.RefObject<HTMLDivElement>,
  agentBlocks: any[],
  isRunning: boolean,
) => {
  const scrollToBottom = useCallback(() => {
    const behavior = isRunning ? 'smooth' : 'auto';
    messagesEndRef.current?.scrollIntoView({ behavior: behavior });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentBlocks, isRunning]);

  return { scrollToBottom };
};
