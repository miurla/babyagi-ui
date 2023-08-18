import { Skill, SkillType } from '../skill';
import { AgentTask } from '@/types';

export class AirtableSaver extends Skill {
  name = 'airtable_saver';
  descriptionForHuman = 'Saves data to Airtable';
  descriptionForModel =
    'Saves data to Airtable. If objective does not include airtable, this skill dont use anytime.';
  icon = '📦';
  type: SkillType = 'dev';

  apiKeysRequired = ['airtable'];

  baseId = 'appXXXXXXX'; // Your base ID here
  tableName = 'Table 1'; // Your table name here

  async execute(
    task: AgentTask,
    dependentTaskOutputs: string,
    objective: string,
  ): Promise<string> {
    if (!this.valid) {
      return '';
    }

    const fields = { Notes: dependentTaskOutputs }; // Your fields here
    const url = `https://api.airtable.com/v0/${this.baseId}/${this.tableName}`;
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKeys['airtable']}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error('Record creation failed');
      }
      return 'Record creation successful';
    } catch (error: any) {
      return `Record creation failed: ${error.message}`;
    }
  }
}
