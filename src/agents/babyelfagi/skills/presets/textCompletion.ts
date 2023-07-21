import { AgentTask } from '@/types';
import { Skill } from '../skill';

export class TextCompletion extends Skill {
  static skillName = 'text_completion';
  static skillDescriptionForHuman =
    "A tool that uses OpenAI's text completion API to generate, summarize, and/or analyze text.";
  static skillDescriptionForModel =
    "A tool that uses OpenAI's text completion API to generate, summarize, and/or analyze text.";
  static skillIcon = '🤖';
  apiKeysRequired = ['openai'];

  async execute(
    task: AgentTask,
    dependentTaskOutputs: string,
    objective: string,
  ): Promise<string> {
    if (!this.valid) return '';

    const prompt = `Complete your assigned task based on the objective and only based on information provided in the dependent task output, if provided. \n###
    Your objective: ${objective}. \n###
    Your task: ${task} \n###
    Dependent tasks output: ${dependentTaskOutputs}  ###
    Your task: ${task}\n###
    RESPONSE:`;

    return this.generateText(prompt, task, {
      temperature: 0.2,
      maxTokens: 800,
    });
  }
}
