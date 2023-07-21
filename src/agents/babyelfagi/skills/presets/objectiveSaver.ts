import { AgentTask } from '@/types';
import { Skill, SkillType } from '../skill';

export class ObjectiveSaver extends Skill {
  name = 'objective_saver';
  descriptionForHuman =
    'A skill that saves a new example_objective based on the concepts from skillSaver.ts';
  descriptionForModel =
    'A skill that saves a new example_objective based on the concepts from skillSaver.ts ';
  icon = '💽';
  type: SkillType = 'dev';
  apiKeysRequired = ['openai'];

  async execute(
    task: AgentTask,
    dependentTaskOutputs: string,
    objective: string,
  ): Promise<string> {
    if (!this.valid) return '';

    const code = dependentTaskOutputs;
    const prompt = `Come up with a file name (eg. 'research_shoes.json') for the following objective:${code}\n###\nFILE_NAME:`;
    const filename = await this.generateText(prompt, task, {
      temperature: 0.2,
    });
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
}
