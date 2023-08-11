import { AgentTask } from '@/types';
import { Skill, SkillType } from '../skill';

export class CodeReader extends Skill {
  name = 'code_reader';
  descriptionForHuman =
    "A skill that finds a file's location in its own program's directory and returns its contents.";
  descriptionForModel =
    "A skill that finds a file's location in its own program's directory and returns its contents.";
  icon = '📖';
  type: SkillType = 'dev';
  apiKeysRequired = ['openai'];

  async execute(
    task: AgentTask,
    dependentTaskOutputs: string,
    objective: string,
  ): Promise<string> {
    if (!this.valid) return '';

    const dirStructure = await this.getDirectoryStructure();

    const prompt = `Find a specific file in a directory and return only the file path, based on the task description below. ###
    First, find the file name in the task description below. Then, find the file path in the directory structure below. Finally, return the file path.###
    Don't use only paths and don't put them in quotes.
    The directory structure of src is as follows: \n${JSON.stringify(
      dirStructure,
    )}
    Your task description: ${task.task}\n###
    RESPONSE:`;
    let filePath = await this.generateText(prompt, task, {
      temperature: 0.2,
      modelName: 'gpt-4',
    });

    console.log(`AI suggested file path: ${filePath}`);

    try {
      const response = await fetch(
        `/api/local/read-file?filename=${encodeURIComponent(filePath)}`,
        {
          method: 'GET',
        },
      );
      if (!response.ok) {
        throw new Error('Failed to read file');
      }
      const fileContent = await response.json();
      console.log(`File content:\n${JSON.stringify(fileContent)}`);
      return JSON.stringify(fileContent);
    } catch (error) {
      console.error(
        "File not found. Please check the AI's suggested file path.",
        error,
      );
      return "File not found. Please check the AI's suggested file path.";
    }
  }
}
