export type SelectItem = {
  id: string;
  name: string;
  message?: string;
  icon?: string;
  badge?: string;
};

export type MessageBlock = {
  id?: number;
  messages: Message[];
  status?: 'complete' | 'incomplete' | 'running';
};

export type Message = {
  id?: number;
  text: string;
  type: MessageType;
  icon?: string;
  title?: string;
  bgColor?: string;
  status?: AgentStatus;
  open?: boolean;
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
  | 'complete'
  | 'failed'
  | 'sufficiency-result' // for mod
  | 'user-input' // for babydeeragi
  | 'task-execute'; // for babydeeragi;

export type AgentStatusType =
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
  | 'managing'
  | 'creating-stream' // for babycatagi
  | 'executing-stream' // for babycatagi
  | 'sufficiency' // for mod
  | 'user-input'; // for babydeeragi

export type UserSettings = {
  openAIApiKey?: string;
  notifications?: boolean;
  enabledGPT4?: boolean;
};

export type UIState = {
  showSidebar: boolean;
};

export type ToolType =
  | 'web-scrape'
  | 'web-search'
  | 'text-completion'
  | 'user-input';
export type TaskStatus = 'complete' | 'incomplete' | 'running';

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
  type: AgentStatusType;
  message?: string;
};
