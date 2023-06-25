import { getUserApiKey } from '@/utils/settings';
import { Message } from '@/types';
import { setupMessage } from '@/utils/message';
import axios from 'axios';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanChatMessage } from 'langchain/schema';

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

  if (!openAIApiKey && process.env.NEXT_PUBLIC_USE_USER_API_KEY === 'true') {
    throw new Error('User API key is not set.');
  }

  if (!openAIApiKey) {
    // server side request
    const response = await axios
      .post(
        '/api/deer/completion',
        {
          prompt,
          model_name: modelName,
        },
        {
          signal: signal,
        },
      )
      .catch((error) => {
        if (error.name === 'AbortError') {
          console.log('Request aborted', error.message);
        } else {
          console.log(error.message);
        }
      });
    return response?.data?.response.text;
  }

  const llm = new ChatOpenAI(
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
              setupMessage('task-execute', chunk, undefined, '🤖', id),
            );
          },
        },
      ],
    },
    { baseOptions: { signal: signal } },
  );

  try {
    const response = await llm.call([new HumanChatMessage(prompt)]);
    //
    messageCallnback?.(
      setupMessage('task-output', response.text, undefined, '✅', id),
    );

    return response.text;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return null;
    }
    console.log('error: ', error);
    return 'Failed to generate text.';
  }
};
