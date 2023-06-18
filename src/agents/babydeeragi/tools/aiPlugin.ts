import { ChatOpenAI } from 'langchain/chat_models/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import {
  RequestsGetTool,
  RequestsPostTool,
  AIPluginTool,
} from 'langchain/tools';

export const aiPlugin = async (
  task: string,
  modelName: string,
  signal?: AbortSignal,
) => {
  const tools = [
    new RequestsGetTool(),
    new RequestsPostTool(),
    await AIPluginTool.fromPluginUrl(
      'https://www.klarna.com/.well-known/ai-plugin.json',
    ),
  ];
  const agent = await initializeAgentExecutorWithOptions(
    tools,
    new ChatOpenAI(
      { temperature: 0, modelName },
      { baseOptions: { signal: signal } },
    ),
    { agentType: 'chat-zero-shot-react-description', verbose: true },
  );

  const result = await agent.call({
    input: task,
  });

  return result.output;
};
