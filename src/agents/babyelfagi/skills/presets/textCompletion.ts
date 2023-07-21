import { AgentTask } from '@/types';
import { Skill } from '../skill';

export class TextCompletion extends Skill {
  name = 'text_completion';
  descriptionForHuman =
    "A tool that uses OpenAI's text completion API to generate, summarize, and/or analyze text.";
  descriptionForModel =
    "A tool that uses OpenAI's text completion API to generate, summarize, and/or analyze text.";
  icon = '🤖';
  apiKeysRequired = ['openai'];

  async execute(
    task: AgentTask,
    dependentTaskOutputs: string,
    objective: string,
  ): Promise<string> {
    if (!this.valid) return '';

    const prompt = `Complete your assigned task based on the objective and only based on information provided in the dependent task output, if provided. \n###
    Output must be answered in ${this.language}.
    Your objective: ${objective}. \n###
    Your task: ${task} \n###
    Dependent tasks output: ${dependentTaskOutputs}  ###
    Your task: ${task}\n###
    RESPONSE:`;

    return this.generateText(prompt, task, {
      temperature: 0.2,
      maxTokens: 800,
      modelName: 'gpt-3.5-turbo-16k',
    });
  }
}
