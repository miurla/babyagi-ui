import {
  AgentStatus,
  AgentTask,
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
      : type === 'next-task' && tool === 'web-search'
      ? '🔍'
      : type === 'next-task' && tool === 'web-scrape'
      ? '📄'
      : type === 'next-task' && tool === 'text-completion'
      ? '🤖'
      : type === 'next-task' && tool === 'user-input'
      ? '🧑‍💻'
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
      : // : type === 'task-output' && tool === 'web-search'
      // ? '🔍'
      // : type === 'task-output' && tool === 'web-scrape'
      // ? '📄'
      // : type === 'task-output' && tool === 'text-completion'
      // ? '🤖'
      // : type === 'task-output' && tool === 'user-input'
      // ? '🧑‍💻'
      type === 'task-output'
      ? '✅'
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
      : '';

  const bgColor =
    type === 'loading'
      ? 'bg-neutral-100 dark:bg-neutral-600/10'
      : 'bg-neutral-50 dark:bg-black';

  return {
    text: text ?? '',
    type: type,
    icon: icon ?? defaultIcon,
    title: title,
    bgColor: bgColor,
    id: id,
  };
};

export const setupMessageWithTask = (task: AgentTask): Message => {
  const skillIcon = task.skill ? task.icon ?? '🛠️' : undefined;
  const toolIcon =
    task.tool === 'web-search'
      ? '🔍'
      : task.tool === 'web-scrape'
      ? '📄'
      : task.tool === 'text-completion'
      ? '🤖'
      : task.tool === 'user-input'
      ? '🧑‍💻'
      : '👉';

  return {
    text: `${task.id}. ${task.task}`,
    type: 'next-task',
    icon: skillIcon ?? toolIcon,
    title: translate('NEXT_TASK', 'message'),
    id: task.id,
    dependentTaskIds: task.dependentTaskIds,
    open: false,
  };
};

export const getMessageText = (message: Message): string => {
  if (
    message.status?.type === 'creating-stream' ||
    message.status?.type === 'executing-stream' ||
    message.type === 'search-logs' ||
    message.type === 'task-execute'
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
      : status.type === 'user-input'
      ? translate('USER_INPUT_WAITING', 'message')
      : translate('THINKING', 'message');

  let title = undefined;
  if (status.type === 'creating-stream' || status.type === 'executing-stream') {
    title = text;
    text = status.message ?? '';
  } else if (status.type === 'executing') {
    text += ` ${status.message ?? ''}`;
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

export const getExportText = (messages: Message[], agentId?: string) => {
  if (agentId === 'babydeeragi' || agentId === 'babyelfagi') {
    // exclude task-execute & user-input messages
    messages = messages.filter(
      (message) =>
        message.type !== 'task-execute' && message.type !== 'user-input',
    );

    // sord by id
    messages.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    // if message is complete, move it to the end
    messages.sort(
      (a, b) =>
        (a.type === 'complete' ? 1 : 0) - (b.type === 'complete' ? 1 : 0),
    );
  }

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
export const getMessageBlocks = (
  messages: Message[],
  isExecutiong: boolean,
) => {
  const messageBlocks: MessageBlock[] = [];

  let currentMessageBlock: MessageBlock | null = null;
  messages.forEach((message) => {
    if (message.id === undefined) {
      currentMessageBlock = {
        messages: [message],
        type: message.type,
      } as MessageBlock;
      messageBlocks.push(currentMessageBlock);
      return;
    }

    // if there is a messageBlock with the same id as message.id, add it there
    const messageBlock = messageBlocks.find(
      (messageBlock) => messageBlock.id === message.id,
    );
    if (messageBlock) {
      messageBlock.messages.push(message);
      if (message.type === 'task-output') {
        messageBlock.status = 'complete';
      } else if (
        message.type === 'task-execute' ||
        message.type === 'search-logs'
      ) {
        messageBlock.status = 'running';
      }
      return;
    }

    // if there is no messageBlock with the same id as message.id, create a new one
    currentMessageBlock = {
      messages: [message],
      id: message.id,
      type: message.type,
      status: message.id === undefined ? 'compete' : 'incomplete',
    } as MessageBlock;
    messageBlocks.push(currentMessageBlock);
  });

  // If (user-input/task-execute) and task-output are in the same messageBlock, exclude user-input
  messageBlocks.forEach((messageBlock) => {
    const excludeIndex = messageBlock.messages.findIndex(
      (message) =>
        message.type === 'user-input' || message.type === 'task-execute',
    );
    const taskOutputIndex = messageBlock.messages.findIndex(
      (message) => message.type === 'task-output',
    );
    if (excludeIndex >= 0 && taskOutputIndex >= 0) {
      messageBlock.messages.splice(excludeIndex, 1);
      messageBlock.status = 'complete';
    }
  });

  // If task-execute and task-output are in the same messageBlock, exclude task-execute
  messageBlocks.forEach((messageBlock) => {
    const taskExecuteIndex = messageBlock.messages.findIndex(
      (message) => message.type === 'task-execute',
    );
    const taskOutputIndex = messageBlock.messages.findIndex(
      (message) => message.type === 'task-list',
    );
    if (taskExecuteIndex >= 0 && taskOutputIndex >= 0) {
      messageBlock.messages.splice(taskExecuteIndex, 1);
      messageBlock.status = 'complete';
    }
  });

  // if isExecutiong is false, exclude task-execute
  if (!isExecutiong) {
    messageBlocks.forEach((messageBlock) => {
      const taskExecuteIndex = messageBlock.messages.findIndex(
        (message) => message.type === 'task-execute',
      );
      if (taskExecuteIndex >= 0) {
        messageBlock.messages.splice(taskExecuteIndex, 1);
      }
      messageBlock.status =
        messageBlock.status === 'running' ? 'incomplete' : 'complete';
    });
  }

  return messageBlocks;
};
