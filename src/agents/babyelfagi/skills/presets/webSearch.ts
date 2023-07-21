import { AgentTask } from '@/types';
import { webBrowsing } from '@/agents/babydeeragi/tools/webBrowsing';
import { Skill } from '../skill';

// This skill is Specialized for web browsing
// using webBrowsing tool in babydeeragi
export class WebSearch extends Skill {
  name = 'web_search';
  descriptionForHuman = 'A tool that performs web searches.';
  descriptionForModel = 'A tool that performs web searches.';
  icon = '🔎';
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
