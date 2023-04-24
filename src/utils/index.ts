import { AgentMessage } from '@/types';

export const getAgentMessage = (text: string): AgentMessage => {
  const type = text.includes('OBJECTIVE')
    ? 'objective'
    : text.includes('TASK LIST')
    ? 'task-list'
    : text.includes('NEXT TASK')
    ? 'next-task'
    : text.includes('TASK RESULT')
    ? 'task-result'
    : text.includes('END OF ITERATIONS')
    ? 'end-of-iterations'
    : 'loading';

  const icon =
    type === 'objective'
      ? '🎯'
      : type === 'task-list'
      ? '📝'
      : type === 'next-task'
      ? '👉'
      : type === 'task-result'
      ? '✅'
      : type === 'loading'
      ? '⏳'
      : type === 'end-of-iterations'
      ? '🏁'
      : '🤖';

  return {
    text: text,
    type: type,
    icon: icon,
  };
};

export const loadingAgentMessage: AgentMessage = {
  text: 'Thinking...',
  type: 'loading',
  icon: '⏳',
};
