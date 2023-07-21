import { AgentTask } from '@/types';
import { Skill } from '../skill';

export class ObjectiveSaver extends Skill {
  static skillName = 'objective_saver';
  static skillDescriptionForHuman =
    'A skill that saves a new example_objective based on the concepts from skillSaver.ts';
  static skillDescriptionForModel =
    'A skill that saves a new example_objective based on the concepts from skillSaver.ts ';
  static skillIcon = '💽';
  static skillType = 'dev';
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
