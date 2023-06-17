import { getUserApiKey } from '@/utils/settings';
import { OpenAIChat } from 'langchain/llms/openai';
import { relevantInfoExtractionPrompt } from './prompt';
import { LLMChain } from 'langchain/chains';
import axios from 'axios';

// TODO: Only client-side requests are allowed.
// To use the environment variable API key, the request must be implemented from the server side.

export const relevantInfoExtractionAgent = async (
  objective: string,
  task: string,
  notes: string,
  chunk: string,
  signal?: AbortSignal,
) => {
  const openAIApiKey = getUserApiKey();
  const modelName = 'gpt-3.5-turbo-16k-0613'; // use a fixed model

  if (!openAIApiKey && process.env.NEXT_PUBLIC_USE_USER_API_KEY === 'true') {
    throw new Error('User API key is not set.');
  }

  if (!openAIApiKey) {
    // server side request
    const response = await axios
      .post(
        '/api/deer/extract',
        {
          objective,
          task,
          notes,
          chunk,
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
    return response?.data?.response;
  }

  const prompt = relevantInfoExtractionPrompt();
  const llm = new OpenAIChat(
    {
      openAIApiKey,
      modelName,
      temperature: 0.7,
      maxTokens: 800,
      topP: 1,
      stop: ['###'],
    },
    { baseOptions: { signal: signal } },
  );
  const chain = new LLMChain({ llm: llm, prompt });
  try {
    const response = await chain.call({
      objective,
      task,
      notes,
      chunk,
    });
    return response.text;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return null;
    }
    console.log('error: ', error);
    return 'Failed to extract relevant information.';
  }
};
