import { AgentTask, LLMParams, Message } from '@/types';
import { setupMessage } from '@/utils/message';
import { getUserApiKey } from '@/utils/settings';
import axios from 'axios';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanChatMessage } from 'langchain/schema';

export type SkillType = 'normal' | 'dev';
export type SkillExecutionLocation = 'client' | 'server';

export class Skill {
  name: string = 'base_kill';
  descriptionForHuman: string = 'This is the base skill.';
  descriptionForModel: string = 'This is the base skill.';
  icon: string = '🛠️';
  type: SkillType = 'normal'; // If available only in the local development environment, be sure to use dev type.
  apiKeysRequired: Array<string | Array<string>> = [];
  valid: boolean;
  apiKeys: { [key: string]: string };
  executionLocation: SkillExecutionLocation = 'client'; // 'client' or 'server'
  // for UI
  messageCallback: (message: Message) => void;
  abortController: AbortController;
  isRunningRef?: React.MutableRefObject<boolean>;
  verbose: boolean;
  language: string = 'en';

  // This index signature allows dynamic assignment of properties
  [key: string]: any;

  constructor(
    apiKeys: { [key: string]: string },
    messageCallback: (message: Message) => void,
    abortController: AbortController,
    isRunningRef?: React.MutableRefObject<boolean>,
    verbose: boolean = false,
    language: string = 'en',
  ) {
    this.apiKeys = apiKeys;
    this.messageCallback = messageCallback;
    this.abortController = abortController;
    this.isRunningRef = isRunningRef;
    this.verbose = verbose;
    this.language = language;

    const missingKeys = this.checkRequiredKeys(apiKeys);
    if (missingKeys.length > 0) {
      console.log(`Missing API keys for ${this.name}: ${missingKeys}`);
      this.valid = false;
    } else {
      this.valid = true;
    }
    for (const key of this.apiKeysRequired) {
      if (Array.isArray(key)) {
        for (const subkey of key) {
          if (subkey in apiKeys) {
            this[`${subkey}_apiKey`] = apiKeys[subkey];
          }
        }
      } else if (key in apiKeys) {
        this[`${key}_apiKey`] = apiKeys[key];
      }
    }

    this.valid =
      this.type === 'dev' ? process.env.NODE_ENV === 'development' : true;
  }

  checkRequiredKeys(apiKeys: {
    [key: string]: string;
  }): Array<string | Array<string>> {
    const missingKeys: Array<string | Array<string>> = [];
    for (const key of this.apiKeysRequired) {
      if (Array.isArray(key)) {
        if (!key.some((k) => k in apiKeys)) {
          missingKeys.push(key);
        }
      } else if (!(key in apiKeys)) {
        missingKeys.push(key);
      }
    }
    return missingKeys;
  }

  async execute(
    task: AgentTask,
    dependentTaskOutputs: string,
    objective: string,
  ): Promise<string> {
    // This method should be overridden by subclasses
    throw new Error("Method 'execute' must be implemented");
  }

  async generateText(
    prompt: string,
    task: AgentTask,
    params?: LLMParams,
    ignoreCallback: boolean = false,
  ): Promise<string> {
    if (getUserApiKey()) {
      let chunk = '';
      const messageCallback = ignoreCallback ? () => {} : this.messageCallback;
      const llm = new ChatOpenAI(
        {
          openAIApiKey: this.apiKeys.openai,
          modelName: params?.modelName ?? 'gpt-3.5-turbo',
          temperature: params?.temperature ?? 0.7,
          maxTokens: params?.maxTokens ?? 1500,
          topP: params?.topP ?? 1,
          frequencyPenalty: params?.frequencyPenalty ?? 0,
          presencePenalty: params?.presencePenalty ?? 0,
          streaming: params?.streaming === undefined ? true : params.streaming,
          callbacks: [
            {
              handleLLMNewToken(token: string) {
                chunk += token;
                messageCallback?.(
                  setupMessage('task-execute', chunk, undefined, '🤖', task.id),
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
    } else {
      // server side request
      const response = await axios
        .post(
          '/api/elf/completion',
          {
            prompt: prompt,
            model_name: params?.modelName ?? 'gpt-3.5-turbo',
            temperature: params?.temperature ?? 0.7,
            max_tokens: params?.maxTokens ?? 1500,
            top_p: params?.topP ?? 1,
            frequency_penalty: params?.frequencyPenalty ?? 0,
            presence_penalty: params?.presencePenalty ?? 0,
          },
          {
            signal: this.abortController.signal,
          },
        )
        .catch((error) => {
          if (error.name === 'AbortError') {
            return undefined;
          }
          console.log('error: ', error);
          return undefined;
        });

      return response?.data.response;
    }
  }

  async getDirectoryStructure(): Promise<any> {
    const response = await fetch('/api/local/directory-structure', {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Failed to get directory structure');
    }
    return await response.json();
  }
}
