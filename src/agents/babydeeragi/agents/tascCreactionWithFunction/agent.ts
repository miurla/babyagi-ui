import { ChatOpenAI } from 'langchain/chat_models/openai';
import { taskCreationChatMessages, taskCreationFunction } from './prompt';
import { AgentTask, FunctionCall, Message } from '@/types';
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
  const websearchVar = 'web-search'; // Enabled by default
  const userinputVar = 'user-input';
  const openAIApiKey = getUserApiKey();
  const messages = taskCreationChatMessages(
    objective,
    websearchVar,
    userinputVar,
    language,
  );

  if (!openAIApiKey) {
    // TODO: Allow requests to be made from the server side
    throw new Error(
      'This agent only supports requests from the client side. To use the API key in environment variables, you need to implement requests from the server side.',
    );
  }

  const model = new ChatOpenAI(
    {
      openAIApiKey,
      modelName,
      temperature: 0,
      maxTokens: 1500,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      maxRetries: 3,
      streaming: false,
      callbacks: [
        {
          // LangChain's issue: handleLLMNewToken called with empty tokens when using function calling
          // https://github.com/hwchase17/langchainjs/issues/1640
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

  let result = '';
  try {
    const response = await model.call(messages, {
      functions: [taskCreationFunction],
    });
    const functrionCall = response.additional_kwargs
      .function_call as FunctionCall;
    result = functrionCall.arguments;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return null;
    }

    throw new Error(error);
  }

  if (!result) {
    return null;
  }

  let taskList: AgentTask[] = [];
  // update task list
  try {
    console.log(result);
    taskList = parseTasks(result, true);
  } catch (error) {
    console.log(error);
    // TODO: handle error
    return null;
  }

  return taskList;
};
