import { AgentTask } from '@/types';
import { Skill } from '../skill';

// This skill uses the GPT-4 model to write code
export class CodeWriter extends Skill {
  static skillName = 'code_writer';
  static skillDescriptionForHuman =
    "A tool that uses OpenAI's text completion API to write code. this tool does not save the code.";
  static skillDescriptionForModel =
    "A tool that uses OpenAI's text completion API to write code. this tool does not save the code.";
  static skillIcon = '🖊️';
  static skillType = 'dev';
  apiKeysRequired = ['openai'];

  async execute(
    task: AgentTask,
    dependentTaskOutputs: string,
    objective: string,
  ): Promise<string> {
    if (!this.valid) return '';

    const prompt = `Your are genius AI programer. Complete your assigned task based on the objective and only based on information provided in the dependent task output, if provided.
    dependent tasks output include reference code.
    Your objective: ${objective}.
    Your task: ${task}
    Dependent tasks output: ${dependentTaskOutputs}
    Your task: ${task}
    RESPONSE:`;

    return this.generateText(prompt, task, {
      modelName: 'gpt-4',
      temperature: 0.2,
      maxTokens: 800,
    });
  }
}
