import { Message, MessageStatus, MessageType } from '@/types';

export const setupMessage = (type: MessageType, text: string): Message => {
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
      : type === 'session-summary'
      ? '📑'
      : type === 'done'
      ? '👍'
      : type === 'complete'
      ? '🎉'
      : '🤖';

  const title =
    type === 'objective'
      ? 'Objective'
      : type === 'task-list'
      ? 'Task List'
      : type === 'next-task'
      ? 'Next Task'
      : type === 'task-result'
      ? 'Task Result'
      : type === 'loading'
      ? 'Loading'
      : type === 'end-of-iterations'
      ? 'End of Iterations'
      : type === 'session-summary'
      ? 'Session Summary'
      : type === 'done'
      ? 'Done'
      : type === 'complete'
      ? 'All Tasks Completed'
      : '';

  const bgColor =
    type === 'loading'
      ? 'bg-gray-100 dark:bg-gray-600/10'
      : type === 'objective' || type === 'task-result'
      ? 'bg-white dark:bg-gray-600/50'
      : 'bg-gray-50 dark:bg-[#444654]';

  return {
    text: text,
    type: type,
    icon: icon,
    title: title,
    bgColor: bgColor,
  };
};

export const getMessageText = (message: Message): string => {
  if (message.title) return `### ${message.title}\n\n ${message.text}`;

  return message.text;
};

export const loadingAgentMessage = (status: MessageStatus) => {
  const text =
    status === 'creating'
      ? 'Creating tasks...'
      : status === 'executing'
      ? 'Executing tasks...'
      : status === 'prioritizing'
      ? 'Prioritizing tasks...'
      : status === 'saving'
      ? 'Saving tasks...'
      : status === 'preparing'
      ? 'Preparing...'
      : status === 'terminating'
      ? 'Terminating...'
      : 'Thinking...';
  return {
    text: text,
    type: 'loading',
    bgColor: 'bg-gray-100 dark:bg-gray-600/10',
  } as Message;
};
