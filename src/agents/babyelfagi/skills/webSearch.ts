import { Skill } from './skill';
import { AgentTask } from '@/types';
import { webBrowsing } from '@/agents/babydeeragi/tools/webBrowsing';

// This skill is Specialized for web browsing
// using webBrowsing tool in babydeeragi
export class webSearch extends Skill {
  name = 'web_search';
  description = 'A tool that performs web searches.';
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
