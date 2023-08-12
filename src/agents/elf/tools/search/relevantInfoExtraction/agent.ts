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
  const modelName = 'gpt-3.5-turbo-16k-0613'; // use a fixed model
  const prompt = relevantInfoExtractionPrompt();
  const llm = new OpenAIChat(
    {
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
