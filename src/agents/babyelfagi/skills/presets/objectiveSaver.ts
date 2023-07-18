import { AgentTask } from '@/types';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { setupMessage } from '@/utils/message';
import { Skill } from '../skill';
import { HumanChatMessage } from 'langchain/schema';

export class ObjectiveSaver extends Skill {
  name = 'objective_saver';
  description =
    'A skill that saves a new example_objective based on the concepts from skillSaver.ts';
  apiKeysRequired = ['openai'];
  icon = '💽';

  async execute(
    task: AgentTask,
    dependentTaskOutputs: string,
    objective: string,
  ): Promise<string> {
    if (!this.valid) return '';

    const code = dependentTaskOutputs;
    const prompt = `Come up with a file name (eg. 'research_shoes.json') for the following objective:${code}\n###\nFILE_NAME:`;
    const filename = await this.generateText(prompt, task);
    const examplesPath = `data/example_objectives/`;

    try {
      const response = await fetch('/api/local/write-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: `${examplesPath}/${filename}`,
          content: `${code}`,
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
        maxTokens: 1500,
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
