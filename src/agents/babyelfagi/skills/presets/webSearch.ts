import { AgentTask } from '@/types';
import { webBrowsing } from '@/agents/babydeeragi/tools/webBrowsing';
import { Skill } from '../skill';

// This skill is Specialized for web browsing
// using webBrowsing tool in babydeeragi
export class WebSearch extends Skill {
  static skillName = 'web_search';
  static skillDescriptionForHuman = 'A tool that performs web searches.';
  static skillDescriptionForModel = 'A tool that performs web searches.';
  static skillIcon = '🔎';
  apiKeysRequired = [];

  async execute(
    task: AgentTask,
    dependentTaskOutputs: string,
    objective: string,
  ): Promise<string> {
    if (!this.valid) return '';

    const taskOutput =
      (await webBrowsing(
        objective,
        task,
        dependentTaskOutputs,
        this.messageCallback,
        undefined,
        this.isRunningRef,
        this.verbose,
        undefined,
        this.language,
        this.abortController.signal,
      )) ?? '';

    return taskOutput;
  }
}
