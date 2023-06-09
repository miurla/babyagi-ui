import {
  AgentStatus,
  Message,
  MessageBlock,
  MessageType,
  ToolType,
} from '@/types';
import { translate } from './translate';

export const setupMessage = (
  type: MessageType,
  text?: string,
  tool?: ToolType,
  icon?: string,
  id?: number,
): Message => {
  const defaultIcon =
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
      : type === 'search-logs'
      ? '🌐'
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
      : type === 'sufficiency-result'
      ? '🤔'
      : type === 'failed'
      ? '❌'
      : type === 'user-input'
      ? '🧑‍💻'
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
      : type === 'search-logs'
      ? translate('SEARCH_LOGS', 'message')
      : type === 'done'
      ? translate('DONE', 'message')
      : type === 'complete'
      ? translate('FINISHED', 'message')
      : type === 'failed'
      ? translate('TASK_FAILED', 'message')
      : type === 'sufficiency-result'
      ? translate('OUTPUT_SUFFICIENCY', 'message')
      : '';

  const bgColor =
    // type === 'loading'
    // ? 'bg-gray-100 dark:bg-gray-600/10'
    // : // : type === 'objective' || type === 'next-task'
    // ? 'bg-white dark:bg-gray-600/50'
    'bg-gray-50 dark:bg-[#444654]';

  return {
    text: text ?? '',
    type: type,
    icon: icon ?? defaultIcon,
    title: title,
    bgColor: bgColor,
    id: id,
  };
};

export const getMessageText = (message: Message): string => {
  if (
    message.status?.type === 'creating-stream' ||
    message.status?.type === 'executing-stream'
  ) {
    return message.text;
  }

  if (message.title) return `### ${message.title}\n\n ${message.text}`;

  return message.text;
};

export const loadingAgentMessage = (status: AgentStatus) => {
  let text =
    status.type === 'creating' || status.type === 'creating-stream'
      ? translate('CREATING', 'message')
      : status.type === 'executing' || status.type === 'executing-stream'
      ? translate('EXECUTING', 'message')
      : status.type === 'prioritizing'
      ? translate('PRIORITIZING', 'message')
      : status.type === 'saving'
      ? translate('SAVING', 'message')
      : status.type === 'preparing'
      ? translate('PREPARING', 'message')
      : status.type === 'terminating'
      ? translate('TERMINATING', 'message')
      : status.type === 'updating'
      ? translate('UPDATING', 'message')
      : status.type === 'summarizing'
      ? translate('SUMMARIZING', 'message')
      : status.type === 'managing'
      ? translate('MANAGING', 'message')
      : status.type === 'sufficiency'
      ? translate('SUFFICIENCY', 'message')
      : status.type === 'user-input'
      ? translate('USER_INPUT_WAITING', 'message')
      : translate('THINKING', 'message');

  let title = undefined;
  if (status.type === 'creating-stream' || status.type === 'executing-stream') {
    title = text;
    text = status.message ?? '';
  } else if (status.message) {
    text += `\n\n${status.message}`;
  }

  return {
    text: text,
    title: title,
    type: 'loading',
    bgColor: 'bg-gray-100 dark:bg-gray-600/10',
    status: status,
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
    case 'user-input':
      return '🧑‍💻';
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

export const getMessageSummaryTitle = (message?: Message) => {
  if (!message) return '';

  if (message.type === 'next-task') {
    return translate('CURRENT_TASK', 'message');
  } else if (message.type === 'task-list') {
    return translate('CURRENT_TASK_LIST', 'message');
  } else if (message.type === 'objective') {
    return translate('OBJECTIVE', 'message');
  } else {
    return '';
  }
};

// create messageBlock array from message array
export const getMessageBlocks = (messages: Message[]) => {
  const messageBlocks: MessageBlock[] = [];

  let currentMessageBlock: MessageBlock | null = null;
  messages.forEach((message) => {
    if (!message.id) {
      currentMessageBlock = { messages: [message] } as MessageBlock;
      messageBlocks.push(currentMessageBlock);
      return;
    }

    // message.id と同一の messageBlock があればそこに追加
    const messageBlock = messageBlocks.find(
      (messageBlock) => messageBlock.id === message.id,
    );
    if (messageBlock) {
      messageBlock.messages.push(message);
      return;
    }

    // message.id と同一の messageBlock がなければ新規作成
    currentMessageBlock = {
      messages: [message],
      id: message.id,
    } as MessageBlock;
    messageBlocks.push(currentMessageBlock);
  });

  return messageBlocks;
};
