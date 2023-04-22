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
    : text.includes('END OF LOOP')
    ? 'end-of-loop'
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
      : type === 'end-of-loop'
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
