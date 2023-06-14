import { OpenAIChat } from 'langchain/llms/openai';
import { taskCreationPrompt } from './prompt';
import { LLMChain } from 'langchain/chains';
import { AgentTask, Message } from '@/types';
import { getUserApiKey } from '@/utils/settings';
import { parseTasks } from '@/utils/task';
import { translate } from '@/utils/translate';

// TODO: Only client-side requests are allowed.
// To use the environment variable API key, the request must be implemented from the server side.

export const taskCreationAgent = async (
  objective: string,
  modelName: string,
  language: string,
  signal?: AbortSignal,
  messageCallback?: (message: Message) => void,
) => {
  let chunk = '```json\n';
  const websearchVar = process.env.SEARP_API_KEY ? '[web-search] ' : ''; // if search api key is not set, don't add [web-search] to the task description
  const userinputVar = '[user-input] ';
  const prompt = taskCreationPrompt();
  const openAIApiKey = getUserApiKey();

  if (!openAIApiKey) {
    // TODO: Allow requests to be made from the server side
    throw new Error(
      'This agent only supports requests from the client side. To use the API key in environment variables, you need to implement requests from the server side.',
    );
  }

  const model = new OpenAIChat(
    {
      openAIApiKey,
      modelName,
      temperature: 0,
      maxTokens: 1500,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      maxRetries: 3,
      streaming: true,
      callbacks: [
        {
          handleLLMNewToken(token: string) {
            chunk += token;
            const message: Message = {
              type: 'task-execute',
              title: translate('CREATING', 'message'),
              text: chunk,
              icon: '📝',
              id: 0,
            };
            messageCallback?.(message);
          },
        },
      ],
    },
    { baseOptions: { signal: signal } },
  );

  let result;
  const chain = new LLMChain({ llm: model, prompt });
  try {
    const response = await chain.call({
      objective,
      websearch_var: websearchVar,
      user_input_var: userinputVar,
      language,
    });
    result = response.text;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return null;
    }
    console.log(error);
    return null;
  }

  if (!result) {
    return null;
  }

  let taskList: AgentTask[] = [];
  // update task list
  try {
    taskList = parseTasks(result);
  } catch (error) {
    console.log(error);
    // TODO: handle error
    return null;
  }

  return taskList;
};
