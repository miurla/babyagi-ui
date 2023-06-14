import { getUserApiKey } from '@/utils/settings';
import { OpenAIChat } from 'langchain/llms/openai';
import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';
import { Message } from '@/types';
import { setupMessage } from '@/utils/message';

export const textCompletionTool = async (
  prompt: string,
  modelName: string,
  signal?: AbortSignal,
  id?: number,
  messageCallnback?: (message: Message) => void,
) => {
  if (prompt.length > 3200) {
    modelName = 'gpt-3.5-turbo-16k-0613';
  }

  let chunk = '';
  const openAIApiKey = getUserApiKey();
  const llm = new OpenAIChat(
    {
      openAIApiKey: openAIApiKey,
      modelName: modelName,
      temperature: 0.2,
      maxTokens: 800,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      streaming: true,
      callbacks: [
        {
          handleLLMNewToken(token: string) {
            chunk += token;
            messageCallnback?.(
              setupMessage('task-output', chunk, undefined, '🤖', id),
            );
          },
        },
      ],
    },
    { baseOptions: { signal: signal } },
  );

  const pt = new PromptTemplate({
    template: prompt,
    inputVariables: [],
    validateTemplate: false,
  });
  const chain = new LLMChain({ llm: llm, prompt: pt });
  try {
    const response = await chain.call({});
    return response.text;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return null;
    }
    console.log('error: ', error);
    return 'Failed to generate text.';
  }
};
