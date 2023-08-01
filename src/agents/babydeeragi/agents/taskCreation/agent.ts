import { OpenAIChat } from 'langchain/llms/openai';
import { taskCreationPrompt } from './prompt';
import { LLMChain } from 'langchain/chains';
import { AgentTask, Message } from '@/types';
import { getUserApiKey } from '@/utils/settings';
import { parseTasks } from '@/utils/task';
import { translate } from '@/utils/translate';
import axios from 'axios';

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
  const websearchVar =
    process.env.SERP_API_KEY || process.env.GOOGLE_SEARCH_API_KEY
      ? '[web-search] '
      : ''; // if search api key is not set, don't add [web-search] to the task description

  const userinputVar = '[user-input] ';
  const prompt = taskCreationPrompt();
  const openAIApiKey = getUserApiKey();

  if (!openAIApiKey && process.env.NEXT_PUBLIC_USE_USER_API_KEY === 'true') {
    throw new Error('User API key is not set.');
  }

  let result = '';
  if (getUserApiKey()) {
    // client side request
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
  } else {
    // server side request
    const response = await axios
      .post(
        '/api/deer/create',
        {
          objective: objective,
          websearch_var: websearchVar,
          user_input_var: userinputVar,
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
    result = response?.data?.response;
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
