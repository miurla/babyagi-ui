import { AgentTask } from '@/types';
import { Skill } from '../skill';

export class DirectoryStructure extends Skill {
  name = 'directory_structure';
  description =
    "A skill that outputs the directory structure of the 'src' folder.";
  icon = '📂';

  async execute(
    task: AgentTask,
    dependentTaskOutputs: any,
    objective: string,
  ): Promise<any> {
    const response = await fetch('/api/local/directory-structure', {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Failed to get directory structure');
    }
    return await response.json();
  }
}
