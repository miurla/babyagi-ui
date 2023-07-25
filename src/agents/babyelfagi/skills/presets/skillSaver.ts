import { AgentTask } from '@/types';
import { Skill, SkillType } from '../skill';

export class SkillSaver extends Skill {
  name = 'skill_saver';
  descriptionForHuman =
    'A skill that saves code written in a previous step into a file within the skills folder. Not for writing code.';
  descriptionForModel =
    'A skill that saves code written in a previous step into a file within the skills folder. Not for writing code. If objective does not include save the skill, this skill dont use anytime.';
  icon = '💾';
  type: SkillType = 'dev';
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
    const codePrompt = `Extract the code and only the code from the dependent task output.
    If it is a markdown code block, extract only the code inside.
    DEPENDENT TASK OUTPUT: ${dependentTaskOutputs}
    CODE:`;
    const code = await this.generateText(codePrompt, task, params);

    const filePrompt = `Come up with a file name (eg. 'getWeather.ts') for the following skill.
    If there is a file name to save in the task, please use it. (eg. 'getWeather.ts')
    TASK: ${task.task}
    CODE: ${code}
    FILE_NAME:`;
    const filename = await this.generateText(filePrompt, task, params);
    let skillsPath = `src/agents/babyelfagi/skills/addons`;

    const dirStructure: string[] = await this.getDirectoryStructure();
    const skillPaths = dirStructure.filter((path) => path.includes(filename));
    if (skillPaths.length > 0) {
      skillsPath = skillPaths[0];
    } else {
      skillsPath += `/${filename}`;
    }

    try {
      const response = await fetch('/api/local/write-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: skillsPath,
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
