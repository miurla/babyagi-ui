import { getUserApiKey } from '@/utils/settings';
import { LLM } from 'langchain/dist/llms/base';
import { OpenAIChat } from 'langchain/llms/openai';
import { relevantInfoExtractionPrompt } from './prompt';
import { LLMChain } from 'langchain';

export const relevantInfoExtractionAgent = async (
  objective: string,
  task: string,
  notes: string,
  chunk: string,
  modelName: string,
) => {
  const openAIApiKey = getUserApiKey();
  const prompt = relevantInfoExtractionPrompt();
  const llm = new OpenAIChat({
    openAIApiKey,
    modelName: modelName,
    temperature: 0.7,
    maxTokens: 800,
    topP: 1,
    stop: ['###'],
  });
  const chain = new LLMChain({ llm: llm, prompt });
  try {
    const response = await chain.call({
      objective,
      task: task,
      notes,
      chunk,
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
