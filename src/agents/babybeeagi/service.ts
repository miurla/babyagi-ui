import { TaskSummarizeChain } from './chains/taskSummerize';
import { TaskOverviewChain } from './chains/taskOverview';
import { TaskManagementChain } from './chains/taskManagement';
import { Task } from './agent';
import { OpenAI, OpenAIChat } from 'langchain/llms/openai';

export const summarizerAgent = async (text: string, openAIApiKey?: string) => {
  const model = new OpenAI({
    openAIApiKey,
    modelName: 'gpt-3.5-turbo',
    temperature: 0.5,
    maxTokens: 100,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  });
  const chain = TaskSummarizeChain.fromLLM({ llm: model });
  const response = await chain._call({
    text,
  });
  return response.text;
};

export const overviewAgent = async (
  objective: string,
  sessionSummary: string,
  lastTaskId: number,
  completedTasksText: string,
  openAIApiKey?: string,
) => {
  const model = new OpenAI({
    openAIApiKey,
    modelName: 'gpt-3.5-turbo',
    temperature: 0.5,
    maxTokens: 200,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  });
  const chain = TaskOverviewChain.fromLLM({ llm: model, verbose: true });
  const response = await chain._call({
    objective,
    session_summary: sessionSummary,
    last_task_id: lastTaskId,
    completed_tasks_text: completedTasksText,
  });
  return response.text;
};

export const taskManagementAgent = async (
  minifiedTaskList: Task[],
  objective: string,
  result: string,
  websearchVar: string,
  modelName: string,
  openAIApiKey?: string,
) => {
  const model = new OpenAIChat({
    openAIApiKey,
    modelName,
    temperature: 0.2,
    maxTokens: 1500,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  });
  const chain = TaskManagementChain.fromLLM({ llm: model });
  const response = await chain._call({
    minified_task_list: minifiedTaskList,
    objective,
    result,
    websearch_var: websearchVar,
  });
  return response.text;
};
