import { PromptTemplate } from 'langchain/prompts';
import { LLMChain, LLMChainInput } from 'langchain/chains';

export class TaskOverviewChain extends LLMChain {
  static fromLLM(fields: Omit<LLMChainInput, 'prompt'>): LLMChain {
    const taskOverviewTemplate =
      `Here is the current session summary:\n{session_summary}` +
      ` to create new tasks with the following objective: {objective},` +
      ` The last completed task is task {last_task_id}.` +
      ` Please update the session summary with the information of the last task:` +
      ` {completed_tasks_text}` +
      ` Updated session summary, which should describe all tasks in chronological order:`;
    const prompt = new PromptTemplate({
      template: taskOverviewTemplate,
      inputVariables: [
        'objective',
        'session_summary',
        'last_task_id',
        'completed_tasks_text',
      ],
    });
    return new TaskOverviewChain({ prompt, ...fields });
  }
}
