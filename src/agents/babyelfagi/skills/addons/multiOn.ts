import axios from 'axios';
import { Skill, SkillExecutionLocation, SkillType } from '../skill';
import { AgentTask } from '@/types';
import { set } from 'lodash';
import { setupMessage } from '@/utils/message';

export class MultiOn extends Skill {
  name = 'multion';
  descriptionForHuman =
    'This skill runs any activities that can be done using browser';
  descriptionForModel =
    'This skill runs any activities that can be done using browser';
  icon = '🪐';

  async execute(
    task: AgentTask,
    dependentTaskOutputs: any,
    objective: string,
  ): Promise<string> {
    if (!this.valid) {
      return '';
    }

    this.messageCallback(
      setupMessage(
        'task-execute',
        'Execute MultiOn Skill',
        undefined,
        '🤖',
        task.id,
      ),
    );

    const prompt = `Generate a query and URL for the task to execute in the browser. 
        Your task is: ${task.task}
        Dependent tasks output: ${dependentTaskOutputs}
        Objective: ${objective}
        Example: { "query" : "What weather", "url" : "https://www.google.com }
      `;
    const response = await this.generateText(prompt, task, undefined, true);
    const json = JSON.parse(response);
    const { query, url } = json;

    try {
      const result = await axios.post('/api/elf/multion', { query, url });
      console.log('result: ', result);
      return `${result.data.message}`;
    } catch (error) {
      console.log(error);
      return 'Multion failed';
    }
  }
}
