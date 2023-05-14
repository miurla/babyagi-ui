import { OpenAI } from 'langchain/llms/openai';

export const textCompletion = async (
  text: string,
  modelName: string,
  openAIApiKey?: string,
) => {
  const tool = new OpenAI({
    openAIApiKey: openAIApiKey,
    modelName: modelName,
    temperature: 0.2,
    maxTokens: 1500,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  });
  const result = await tool.call(text);
  return result;
};
