import { AgentTask } from '@/types';
import { Skill, SkillType } from '../skill';

/**
 * This skill uses the GPT-4 model to write code
 * It takes in a task, dependent task outputs, and an objective, and returns a string
 */

// Constants for the GPT-4 model
const MODEL_NAME = 'gpt-4';
const TEMPERATURE = 0.2;
const MAX_TOKENS = 800;

export class CodeWriter extends Skill {
  readonly name = 'code_writer';
  readonly descriptionForHuman =
    "A tool that uses OpenAI's text completion API to write code. This tool does not save the code.";
  readonly descriptionForModel =
    "A tool that uses OpenAI's text completion API to write code. This tool does not save the code. This skill must be a dependent task on the code_reader skill.";
  readonly icon = '🖊️';
  readonly type: SkillType = 'dev';
  readonly apiKeysRequired = ['openai'];

  // The execute function takes in a task, dependent task outputs, and an objective, and returns a string
  async execute(
    task: AgentTask,
    dependentTaskOutputs: string,
    objective: string,
  ): Promise<string> {
    if (!this.valid) {
      throw new Error('Invalid state');
    }

    const prompt = `
      You are a genius AI programmer. 
      Complete your assigned task based on the objective and only based on information provided in the dependent task output, if provided.
      Dependent tasks output include reference code.
      Your objective: ${objective}.
      Your task: ${task}
      Dependent tasks output: ${dependentTaskOutputs}
      RESPONSE:
    `;

    try {
      return await this.generateText(prompt, task, {
        modelName: MODEL_NAME,
        temperature: TEMPERATURE,
        maxTokens: MAX_TOKENS,
      });
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }
}
