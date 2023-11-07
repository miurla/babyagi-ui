import { AgentMessage, AgentTask, LLMParams } from '@/types';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanChatMessage } from 'langchain/schema';

export const textCompletion = async (
  prompt: string,
  id: string,
  task: AgentTask,
  modelName: string,
  userApiKey?: string,
  signal?: AbortSignal,
  messageCallnback?: (message: AgentMessage) => void,
) => {
  if (modelName !== 'gpt-4-1106-preview' && prompt.length > 3200) {
    modelName = 'gpt-3.5-turbo-16k';
  }

  const llm = new ChatOpenAI(
    {
      openAIApiKey: userApiKey,
      modelName,
      temperature: 0.2,
      maxTokens: 800,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      streaming: true,
      callbacks: [
        {
          handleLLMNewToken(token: string) {
            messageCallnback?.({
              content: token,
              type: task.skill,
              id: id,
              taskId: task.id.toString(),
              status: 'running',
            });
          },
        },
      ],
    },
    { baseOptions: { AbortSignal: signal } },
  );

  try {
    const response = await llm.call([new HumanChatMessage(prompt)]);
    messageCallnback?.({
      content: response.text,
      type: task.skill,
      id: id,
      taskId: task.id.toString(),
      status: 'complete',
    });

    if (messageCallnback instanceof AbortSignal) {
      throw new Error('messageCallnback cannot be of type AbortSignal');
    }

    return response.text;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return null;
    }
    console.log('error: ', error);
    return 'Failed to generate text.';
  }
};

export const generateText = async (
  prompt: string,
  params: LLMParams = {},
  userKey?: string,
  signal?: AbortSignal,
) => {
  const modelName = 'gpt-3.5-turbo';
  const temperature = 0.7;
  const maxTokens = 1500;
  const topP = 1;
  const frequencyPenalty = 0;
  const presencePenalty = 0;
  const streaming = false;
  const callbacks = undefined;

  const llmParams = {
    ...params,
    modelName,
    temperature,
    maxTokens,
    topP,
    frequencyPenalty,
    presencePenalty,
    streaming,
    callbacks,
  };

  const llm = new ChatOpenAI({
    ...llmParams,
    openAIApiKey: userKey,
    verbose: false,
  });

  try {
    const response = await llm.call([new HumanChatMessage(prompt)]);
    return response.text;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return null;
    }
    console.log('error: ', error);
    return 'Failed to generate text.';
  }
};
