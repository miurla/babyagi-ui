export type SelectItem = {
  id: string;
  name: string;
  message?: string;
  icon?: string;
  badge?: string;
};

export type Message = {
  text: string;
  type: MessageType;
  icon?: string;
  title?: string;
  bgColor?: string;
  status?: AgentStatus;
};

export type Execution = {
  id: string;
  name: string;
  params: ExecutionParams;
  messages: Message[];
  date: string;
  evaluation?: 'good' | 'bad';
};

export type ExecutionParams = {
  model: SelectItem;
  iterations: SelectItem;
  firstTask: string;
  objective: string;
  agent: AgentType;
};

export type AgentType = 'babyagi' | 'babybeeagi' | 'babycatagi' | 'none';

export type MessageType =
  | 'objective'
  | 'task-list'
  | 'next-task'
  | 'task-result'
  | 'task-output'
  | 'task-result-summary'
  | 'search-logs'
  | 'loading'
  | 'end-of-iterations'
  | 'session-summary'
  | 'done'
  | 'complete';

export type AgentStatusType =
  | 'preparing'
  | 'creating'
  | 'executing'
  | 'prioritizing'
  | 'saving'
  | 'running'
  | 'task-started'
  | 'task-completed'
  | 'terminating'
  | 'finished'
  | 'ready'
  | 'closing'
  | 'updating'
  | 'summarizing'
  | 'managing'
  | 'creating-stream' // for babycatagi
  | 'executing-stream'; // for babycatagi

export type UserSettings = {
  openAIApiKey?: string;
  notifications?: boolean;
};

export type ToolType = 'web-scrape' | 'web-search' | 'text-completion';
export type TaskStatus = 'complete' | 'incomplete';

export interface AgentTask {
  id: number;
  task: string;
  tool: ToolType;
  dependentTaskIds?: number[];
  status: TaskStatus;
  output?: string; // for babycatagi
  result?: string; // for babybeeagi
  resultSummary?: string; // for babybeeagi
  dependentTaskId?: number; // for babybeeagi
}

export type AgentStatus = {
  taskId?: null | undefined | number;
  type: AgentStatusType;
  message?: string;
};
