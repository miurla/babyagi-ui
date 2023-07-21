import Airtable from 'airtable';
import { Skill } from '../skill';
import { AgentTask } from '@/types';

export class AirtableSaver extends Skill {
  static skillName = 'airtable_saver';
  static skillDescriptionForHuman = 'Saves data to Airtable';
  static skillDescriptionForModel = 'Saves data to Airtable';
  static skillIcon = '📦';
  static skillType = 'dev';

  apiKeysRequired = ['airtable'];

  baseId = 'appXXXXXXX'; // Your base ID here
  tableName = 'Table 1'; // Your table name here

  async execute(
    task: AgentTask,
    dependentTaskOutputs: any,
    objective: string,
  ): Promise<string> {
    if (!this.valid) {
      return '';
    }

    const airtable = new Airtable({ apiKey: this.apiKeys['airtable'] });
    const base = airtable.base(this.baseId);
    const fields = { Notes: dependentTaskOutputs }; // Your fields here

    try {
      await base(this.tableName).create([{ fields }]);
      return 'Record creation successful';
    } catch (error: any) {
      return `Record creation failed: ${error.message}`;
    }
  }
}
