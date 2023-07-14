import { ChatOpenAI } from 'langchain/chat_models/openai';
import { Skill } from './skill';

export class TextCompletion extends Skill {
  name = 'text_completion';
  description =
    "A tool that uses OpenAI's text completion API to generate, summarize, and/or analyze text and code.";
  apiKeysRequired = ['openai'];

  constructor(apiKeys: { [key: string]: string }) {
    super(apiKeys);
  }

  async execute(
    params: any,
    dependentTaskOutputs: any,
    objective: string,
  ): Promise<string> {
    if (!this.valid) return '';

    const taskPrompt = `Complete your assigned task based on the objective and only based on information provided in the dependent task output, if provided. \n###\nYour objective: ${objective}. \n###\nYour task: ${params} \n###\nDependent tasks output: ${dependentTaskOutputs}  \n###\nYour task: ${params}\n###\nRESPONSE:`;

    const messages = [{ role: 'user', content: taskPrompt }];

    const llm = new ChatOpenAI(
      {
        openAIApiKey: '',
        modelName: '',
        temperature: 0.2,
        maxTokens: 800,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        streaming: true,
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              // chunk += token;
              // messageCallnback?.(
              //   setupMessage('task-execute', chunk, undefined, '🤖', id),
              // );
            },
          },
        ],
      },
      { baseOptions: { signal: null } },
    );

    //   try {
    //     const response = await llm.call([new HumanChatMessage(prompt)]);
    //     //
    //     messageCallnback?.(
    //       setupMessage('task-output', response.text, undefined, '✅', id),
    //     );

    //     return response.text;
    //   } catch (error: any) {
    //     if (error.name === 'AbortError') {
    //       return null;
    //     }
    //     console.log('error: ', error);
    //     return 'Failed to generate text.';
    //   }

    return '';
  }
}
