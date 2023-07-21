import { AgentTask } from '@/types';
import { Skill, SkillType } from '../skill';

// This skill uses the GPT-4 model to write code
export class CodeWriter extends Skill {
  name = 'code_writer';
  descriptionForHuman =
    "A tool that uses OpenAI's text completion API to write code. this tool does not save the code.";
  descriptionForModel =
    "A tool that uses OpenAI's text completion API to write code. this tool does not save the code.";
  icon = '🖊️';
  type: SkillType = 'dev';
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
