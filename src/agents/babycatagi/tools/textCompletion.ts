import { OpenAI } from 'langchain/llms/openai';

export const textCompletion = async (
  text: string,
  modelName: string,
  abortSignal?: AbortSignal,
  openAIApiKey?: string,
  callback?: (token: string) => void,
) => {
  const tool = new OpenAI(
    {
      openAIApiKey: openAIApiKey,
      modelName: modelName,
      temperature: 0.2,
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
    { baseOptions: { signal: abortSignal } },
  );

  try {
    const response = await tool.call(text);
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return null;
    }
    console.log('error: ', error);
    return error;
  }
};
