import { AgentStatus, Message, MessageType, ToolType } from '@/types';
import { translate } from './translate';

export const setupMessage = (
  type: MessageType,
  text: string,
  tool?: ToolType,
): Message => {
  const icon =
    type === 'objective'
      ? '🎯'
      : type === 'task-list'
      ? '📝'
      : type === 'next-task'
      ? '👉'
      : type === 'task-result' && tool === 'web-search'
      ? '🔍'
      : type === 'task-result' && tool === 'web-scrape'
      ? '📄'
      : type === 'task-result' && tool === 'text-completion'
      ? '🤖'
      : type === 'task-result'
      ? '✅'
      : type === 'task-result-summary'
      ? '📋'
      : type === 'loading'
      ? '⏳'
      : type === 'end-of-iterations'
      ? '🏁'
      : type === 'session-summary'
      ? '📑'
      : type === 'done'
      ? '✅'
      : type === 'complete'
      ? '🏁'
      : type === 'task-output' && tool === 'web-search'
      ? '🔍'
      : type === 'task-output' && tool === 'web-scrape'
      ? '📄'
      : type === 'task-output' && tool === 'text-completion'
      ? '🤖'
      : '🤖';

  const title =
    type === 'objective'
      ? translate('OBJECTIVE', 'message')
      : type === 'task-list'
      ? translate('TASK_LIST', 'message')
      : type === 'next-task'
      ? translate('NEXT_TASK', 'message')
      : type === 'task-result'
      ? translate('TASK_RESULT', 'message')
      : type === 'task-output'
      ? translate('TASK_OUTPUT', 'message')
      : type === 'task-result-summary'
      ? translate('TASK_RESULT_SUMMARY', 'message')
      : type === 'loading'
      ? translate('LOADING', 'message')
      : type === 'end-of-iterations'
      ? translate('END_OF_ITERATIONS', 'message')
      : type === 'session-summary'
      ? translate('SESSION_SUMMARY', 'message')
      : type === 'done'
      ? translate('DONE', 'message')
      : type === 'complete'
      ? translate('FINISHED', 'message')
      : '';

  const bgColor =
    type === 'loading'
      ? 'bg-gray-100 dark:bg-gray-600/10'
      : type === 'objective' || type === 'next-task'
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

export const loadingAgentMessage = (status: AgentStatus) => {
  let text =
    status.type === 'creating'
      ? translate('CREATING', 'message')
      : status.type === 'executing'
      ? translate('EXECUTING', 'message')
      : status.type === 'prioritizing'
      ? translate("PRIORITIZING", "message")
      : status.type === 'saving'
      ? translate("SAVING", "message")
      : status.type === 'preparing'
      ? translate("PREPARING", "message")
      : status.type === 'terminating'
      ? translate("TERMINATING", "message")
      : status.type === 'updating'
      ? translate("UPDATING", "message")
      : status.type === 'summarizing'
      ? translate("SUMMARIZING", "message")
      : status.type === 'managing'
      ? translate('MANAGING', 'message')
      : translate("THINKING", "message");

  if (status.message) text += `\n\n${status.message}`;

  return {
    text: text,
    type: 'loading',
    bgColor: 'bg-gray-100 dark:bg-gray-600/10',
  } as Message;
};

export const getToolIcon = (tool: ToolType) => {
  switch (tool) {
    case 'web-search':
      return '🔍';
    case 'web-scrape':
      return '📄';
    case 'text-completion':
      return '🤖';
    default:
      return '🤖';
  }
};

export const getExportText = (messages: Message[]) => {
  const text = messages
    .map((message) => `## ${message.icon} ${message.title}\n${message.text}`)
    .join('\n\n');
  return text;
};
