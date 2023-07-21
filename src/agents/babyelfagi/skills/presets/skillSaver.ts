import { AgentTask } from '@/types';
import { Skill } from '../skill';

export class SkillSaver extends Skill {
  static skillName = 'skill_saver';
  static skillDescriptionForHuman =
    'A skill that saves code written in a previous step into a file within the skills folder. Not for writing code.';
  static skillDescriptionForModel =
    'A skill that saves code written in a previous step into a file within the skills folder. Not for writing code. Never use this skill for anything other than storing non-skill codes.';
  static skillIcon = '💾';
  static skillType = 'dev';
  apiKeysRequired = ['openai'];

  async execute(
    task: AgentTask,
    dependentTaskOutputs: any,
    objective: string,
  ): Promise<string> {
    if (!this.valid) return '';

    const params = {
      temperature: 0.2,
      maxTokens: 800,
    };
    const codePrompt = `Extract the code and only the code from the dependent task output here: ${dependentTaskOutputs}  \n###\nCODE:`;
    const code = await this.generateText(codePrompt, task, params);

    console.log('dependentTaskOutputs', dependentTaskOutputs);
    console.log('code', code);

    const filePrompt = `Come up with a file name (eg. 'getWeather.ts') for the following skill:${code}\n###\nFILE_NAME:`;
    const filename = await this.generateText(filePrompt, task, params);
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
}
