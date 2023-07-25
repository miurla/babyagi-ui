import { AgentTask } from '@/types';
import { Skill, SkillType } from '../skill';

// Define constants
const DESCRIPTION =
  'A skill that reviews code and provides comments to improve its quality.';
const ICON = '👨‍💻';
const MODEL_NAME = 'gpt-4';

export class CodeReviewer extends Skill {
  readonly name = 'code_reviewer';
  readonly descriptionForHuman = DESCRIPTION;
  readonly descriptionForModel = DESCRIPTION;
  readonly icon = ICON;
  readonly type: SkillType = 'dev';
  readonly apiKeysRequired = ['openai'];

  generatePrompt(code: string): string {
    return `Code review comments for the following code:\n\n${code}\n\nComments:`;
  }

  async execute(
    task: AgentTask,
    dependentTaskOutputs: string,
  ): Promise<string> {
    if (!this.valid)
      throw new Error(
        'Skill is not valid. Please check the required API keys.',
      );

    const prompt = this.generatePrompt(dependentTaskOutputs);

    try {
      return this.generateText(prompt, task, { modelName: MODEL_NAME });
    } catch (error) {
      console.error('Failed to generate text:', error);
      throw new Error(
        'Failed to generate text. Please check your input and try again.',
      );
    }
  }
}
