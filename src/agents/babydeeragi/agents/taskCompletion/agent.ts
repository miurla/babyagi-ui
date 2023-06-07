import { AgentStatus, AgentTask } from '@/types';
import { taskCompletionPrompt } from './prompt';
import { OpenAIChat } from 'langchain/llms/openai';
import { getUserApiKey } from '@/utils/settings';
import { LLMChain } from 'langchain/chains';

// TODO: Only client-side requests are allowed.
// To use the environment variable API key, the request must be implemented from the server side.

export const taskCompletionAgent = async (
  task: AgentTask,
  taskList: AgentTask[],
  objective: string,
  modelName: string,
  signal?: AbortSignal,
  statusCallback?: (status: AgentStatus) => void,
) => {
  let chunk = '```json\n';
  const prompt = taskCompletionPrompt(taskList, task);
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
      callbacks: [
        {
          handleLLMNewToken(token: string) {
            chunk += token;
            statusCallback?.({ type: 'executing-stream', message: chunk });
          },
        },
      ],
    },
    { baseOptions: { signal: signal } },
  );

  const chain = new LLMChain({ llm: llm, prompt });
  try {
    const response = await chain.call({
      objective,
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
