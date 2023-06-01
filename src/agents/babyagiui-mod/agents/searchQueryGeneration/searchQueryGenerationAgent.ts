import { AgentStatus, AgentTask } from '@/types';
import { searchQueryGenerationPrompt } from './searchQueryGenerationQuery';
import { OpenAIChat } from 'langchain/llms/openai';
import { getUserApiKey } from '@/utils/settings';
import { LLMChain } from 'langchain/chains';

// TODO: Only client-side requests are allowed.
// To use the environment variable API key, the request must be implemented from the server side.

export const searchQueryGenerationAgent = async (
  task: AgentTask,
  modelName: string,
  signal?: AbortSignal,
) => {
  const prompt = searchQueryGenerationPrompt();
  const openAIApiKey = getUserApiKey();
  const llm = new OpenAIChat(
    {
      openAIApiKey: openAIApiKey,
      modelName: modelName,
      temperature: 0.2,
      maxTokens: 1500,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      streaming: true,
    },
    { baseOptions: { signal: signal } },
  );

  const chain = new LLMChain({ llm: llm, prompt });
  try {
    const response = await chain.call({
      task: task.task,
    });
    return response.text;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return null;
    }
    console.log('error: ', error);
    return null;
  }
};
