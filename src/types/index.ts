export type SelectItem = {
  id: string;
  name: string;
  message?: string;
  icon?: string;
};

export type AgentMessage = {
  text: string;
  icon: string;
  type: AgentMessageType;
};

export type AgentMessageType =
  | 'objective'
  | 'task-list'
  | 'next-task'
  | 'task-result'
  | 'loading'
  | 'end-of-iterations';

export type UserSettings = {
  openAIApiKey?: string;
  pineconeApiKey?: string;
  pineconeEnvironment?: string;
};
