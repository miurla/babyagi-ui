import { AgentTask } from '@/types';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { setupMessage } from '@/utils/message';
import { HumanChatMessage } from 'langchain/schema';
import { Skill } from '../skill';

export class SkillSaver extends Skill {
  name = 'skill_saver';
  description =
    'A skill that saves code written in a previous step into a file within the skills folder. Not for writing code.';
  apiKeysRequired = ['openai'];
  icon = '💾';

  async execute(
    task: AgentTask,
    dependentTaskOutputs: any,
    objective: string,
  ): Promise<string> {
    if (!this.valid) return '';

    const codePrompt = `Extract the code and only the code from the dependent task output here: ${dependentTaskOutputs}  \n###\nCODE:`;
    const code = await this.generateText(codePrompt, task);

    const filePrompt = `Come up with a file name (eg. 'getWeather.ts') for the following skill:${code}\n###\nFILE_NAME:`;
    const filename = await this.generateText(filePrompt, task);
    const skillsPath = `src/agents/babyelfagi/skills/addons`;

    try {
      const response = await fetch('/api/local/write-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: `${skillsPath}/${filename}`,
          content: code,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to save file');
      }
      return `Code saved successfully: ${filename}`;
    } catch (error) {
      console.error('Error saving code.', error);
      return 'Error saving code.';
    }
  }

  async generateText(prompt: string, task: AgentTask): Promise<string> {
    const messageCallback = this.messageCallback;
    const llm = new ChatOpenAI(
      {
        openAIApiKey: this.apiKeys.openai,
        modelName: 'gpt-3.5-turbo',
        temperature: 0.2,
        maxTokens: 800,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        streaming: true,
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              messageCallback?.(
                setupMessage('task-execute', token, undefined, '🤖', task.id),
              );
            },
          },
        ],
      },
      { baseOptions: { signal: this.abortController.signal } },
    );

    try {
      const response = await llm.call([new HumanChatMessage(prompt)]);
      messageCallback?.(
        setupMessage('task-output', response.text, undefined, '✅', task.id),
      );
      return response.text;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return `Task aborted.`;
      }
      console.log('error: ', error);
      return 'Failed to generate text.';
    }
  }
}
