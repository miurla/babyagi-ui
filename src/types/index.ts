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

export type MessageType =
  | 'objective'
  | 'task-list'
  | 'next-task'
  | 'task-result'
  | 'loading'
  | 'end-of-iterations';

export type MessageStatus =
  | 'preparing'
  | 'creating'
  | 'executing'
  | 'prioritizing'
  | 'saving'
  | 'finished'
  | 'none';

export type UserSettings = {
  openAIApiKey?: string;
  pineconeApiKey?: string;
  pineconeEnvironment?: string;
};
