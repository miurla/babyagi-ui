import { OpenAI, OpenAIChat } from 'langchain/llms/openai';
import { relevantInfoExtractionChain } from './chains/relevantInfoExtraction';
import { TaskCreationChain } from './chains/taskCreation';

export const taskCreationAgent = async (
  objective: string,
  websearchVar: string,
  modelName: string,
  language: string,
  signal?: AbortSignal,
  openAIApiKey?: string,
  callback?: (token: string) => void,
) => {
  const model = new OpenAIChat(
    {
      openAIApiKey,
      modelName,
      temperature: 0,
      maxTokens: 1500,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      streaming: true,
      callbacks: [
        {
          handleLLMNewToken(token: string) {
            if (callback) {
              callback(token);
            }
          },
        },
      ],
    },
    { baseOptions: { signal: signal } },
  );
  const chain = TaskCreationChain.fromLLM({ llm: model });

  try {
    const response = await chain.call({
      objective,
      websearch_var: websearchVar,
      language,
    });
    return response.text;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return null;
    }
    console.log('error: ', error);
    return error;
  }
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
    modelName: 'gpt-3.5-turbo-0613',
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
