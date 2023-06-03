import { OpenAIChat } from 'langchain/llms/openai';
import { taskCreationPrompt } from './prompt';
import { LLMChain } from 'langchain';
import { AgentStatus, AgentTask } from '@/types';
import { getUserApiKey } from '@/utils/settings';
import { parseTasks } from '@/utils/task';

// TODO: Only client-side requests are allowed.
// To use the environment variable API key, the request must be implemented from the server side.

export const taskCreationAgent = async (
  objective: string,
  modelName: string,
  language: string,
  signal?: AbortSignal,
  statusCallback?: (status: AgentStatus) => void,
) => {
  let chunk = '```json\n';
  const websearchVar = process.env.SEARP_API_KEY ? '[web-search] ' : ''; // if search api key is not set, don't add [web-search] to the task description
  const prompt = taskCreationPrompt();
  const openAIApiKey = getUserApiKey();
  const model = new OpenAIChat(
    {
      openAIApiKey,
      modelName,
      temperature: 0,
      maxTokens: 1500,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      streaming: true,
      callbacks: [
        {
          handleLLMNewToken(token: string) {
            chunk += token;
            statusCallback?.({ type: 'creating-stream', message: chunk });
          },
        },
      ],
    },
    { baseOptions: { signal: signal } },
  );

  let result = '';
  const chain = new LLMChain({ llm: model, prompt });
  try {
    const response = await chain.call({
      objective,
      websearch_var: websearchVar,
      language: language,
    });
    result = response.text;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return null;
    }
    console.log('error: ', error);
    return null;
  }

  if (!result) {
    return [];
  }

  let taskList: AgentTask[] = [];
  // update task list
  try {
    taskList = parseTasks(result);
  } catch (error) {
    console.error(error);
    // TODO: handle error
  }

  return taskList;
};
