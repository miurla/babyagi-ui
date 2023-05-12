export type SelectItem = {
  id: string;
  name: string;
  message?: string;
  icon?: string;
};

export type Message = {
  text: string;
  type: MessageType;
  icon?: string;
  title?: string;
  bgColor?: string;
  status?: MessageStatus;
};

export type Execution = {
  id: string;
  name: string;
  params: ExecutionParams;
  messages: Message[];
  date: string;
};

export type ExecutionParams = {
  model: SelectItem;
  iterations: SelectItem;
  firstTask: string;
  objective: string;
  agent: AgentType;
};

export type AgentType = 'babyagi' | 'babybeeagi' | 'none';

export type MessageType =
  | 'objective'
  | 'task-list'
  | 'next-task'
  | 'task-result'
  | 'task-result-summary'
  | 'loading'
  | 'end-of-iterations'
  | 'session-summary'
  | 'done'
  | 'complete';

export type MessageStatus =
  | 'preparing'
  | 'creating'
  | 'executing'
  | 'prioritizing'
  | 'saving'
  | 'terminating'
  | 'finished'
  | 'ready'
  | 'closing'
  | 'updating'
  | 'summarizing'
  | 'managing';

export type UserSettings = {
  openAIApiKey?: string;
};

export type ToolType = 'web-scrape' | 'web-search' | 'text-completion';
export type TaskStatus = 'complete' | 'incomplete';
