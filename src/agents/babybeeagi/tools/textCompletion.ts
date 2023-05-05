import { OpenAI } from 'langchain/llms/openai';

export const textCompletion = async (text: string, openAIApiKey?: string) => {
  const tool = new OpenAI({
    openAIApiKey: openAIApiKey,
    temperature: 0.5,
    maxTokens: 1500,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  });
  const result = await tool.call(text);
  return result;
};
