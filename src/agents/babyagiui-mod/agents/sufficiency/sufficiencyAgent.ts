// sufficiencyAgent.ts //
import { AgentStatus, AgentTask } from '@/types';
import { sufficiencyPrompt } from './sufficiencyPrompt';
import { OpenAIChat } from 'langchain/llms/openai';
import { getUserApiKey } from '@/utils/settings';
import { LLMChain } from 'langchain/chains';

// TODO: Only client-side requests are allowed.
// To use the environment variable API key, the request must be implemented from the server side.

export const sufficiencyAgent = async (
  task: AgentTask,
  taskList: AgentTask[],
  taskResult: string,
  objective: string,
  modelName: string,
  signal?: AbortSignal,
) => {
  const prompt = sufficiencyPrompt(taskList, task, taskResult);
  const openAIApiKey = getUserApiKey();
  const llm = new OpenAIChat(
    {
      openAIApiKey: openAIApiKey,
      modelName: modelName,
      temperature: 0,
      maxTokens: 1500,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      streaming: false,
    },
    { baseOptions: { signal: signal } },
  );

  const chain = new LLMChain({ llm: llm, prompt });
  try {
    const response = await chain.call({
      objective,
      task: task.task,
    });
    const parsedResponse = JSON.parse(response.text);
    return {
      status: parsedResponse.status || 'incomplete',
      reason: parsedResponse.reason || '',
      updated_task: parsedResponse.updated_task || '',
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return null;
    }
    console.log('error: ', error);
    return null;
  }
};
