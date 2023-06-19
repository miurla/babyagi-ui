import { ChatOpenAI } from 'langchain/chat_models/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import {
  RequestsGetTool,
  RequestsPostTool,
  AIPluginTool,
} from 'langchain/tools';
import { getUserApiKey } from '@/utils/settings';
import { AgentTask, Message } from '@/types';

export const aiPlugin = async (
  objective: string,
  task: AgentTask,
  dependentTaskOutput: string,
  url: string,
  language: string,
  modelName: string,
  messageCallback?: (message: Message) => void,
  signal?: AbortSignal,
) => {
  const openAIApiKey = getUserApiKey();
  const tools = [
    new RequestsGetTool(),
    new RequestsPostTool(),
    await AIPluginTool.fromPluginUrl(url),
  ];
  let chunk = '```markdown\n';

  const callback = (text: string) => {
    chunk += `${text}\n`;
    const message: Message = {
      type: 'task-execute',
      title: 'Running Plugin...',
      text: chunk,
      icon: '🔌',
      id: task.id,
    };
    messageCallback?.(message);
  };

  const agent = await initializeAgentExecutorWithOptions(
    tools,
    new ChatOpenAI(
      {
        temperature: 0,
        modelName: 'gpt-3.5-turbo-16k-0613',
        openAIApiKey,
        streaming: true,
        callbacks: [
          {
            handleLLMStart() {
              callback(`- LLM started.`);
            },
            handleLLMEnd(output) {
              callback(
                ` - End: ${output.generations?.[0][0]?.text.substring(
                  0,
                  100,
                )} ...`,
              );
            },
            handleToolStart(tool) {
              callback(`- ${tool.id} started.`);
            },
            handleToolEnd(output, runId, parentRunId) {
              callback(` - End: ${output.substring(0, 100)} ...`);
            },
          },
        ],
      },
      { baseOptions: { signal: signal } },
    ),
    { agentType: 'chat-zero-shot-react-description', verbose: true },
  );

  const input = `task: ${task.task}.`; //dependentTasks: ${dependentTaskOutput}. objective: ${objective}. Answer in ${language}.`;
  const result = await agent.call({
    input: input,
  });

  console.log(result.output);

  return result?.output ?? 'failed';
};

interface AIPlugin {
  description_for_human: string;
}

export const aiPluginDescription = async (url: string) => {
  try {
    const response = await fetch(url);
    const data: AIPlugin = await response.json();
    return data.description_for_human;
  } catch (e) {
    throw new Error('Failed to get plugin description.');
  }

  //   use Langchain's AIPluginTool class
  //   const tool = await AIPluginTool.fromPluginUrl(url);
  //   return tool.description;
};
