import { OpenAI, OpenAIChat } from 'langchain/llms/openai';
import { relevantInfoExtractionChain } from './chains/relevantInfoExtraction';
import { TaskCreationChain } from './chains/taskCreation';
import { AgentTask } from '@/types';
import { stringifyTasks } from '@/utils/task';

export const taskCreationAgent = async (
  objective: string,
  websearchVar: string,
  modelName: string,
  openAIApiKey?: string,
) => {
  const model = new OpenAIChat({
    openAIApiKey,
    modelName,
    temperature: 0,
    maxTokens: 1500,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  });
  const chain = TaskCreationChain.fromLLM({ llm: model });

  const response = await chain.call({
    objective,
    websearch_var: websearchVar,
  });
  return response.text;
};

export const extractRelevantInfoAgent = async (
  objective: string,
  task: string,
  notes: string,
  chunk: string,
  openAIApiKey?: string,
) => {
  const model = new OpenAI({
    openAIApiKey,
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 800,
    n: 1,
    stop: ['###'],
  });
  const chain = relevantInfoExtractionChain.fromLLM({ llm: model });
  const response = await chain.call({
    objective,
    task: task,
    notes,
    chunk,
  });
  return response.text;
};
