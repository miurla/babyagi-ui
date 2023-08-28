import { PromptTemplate } from 'langchain/prompts';
import { LLMChain, LLMChainInput } from 'langchain/chains';

export class TaskCreationChain extends LLMChain {
  static fromLLM(fields: Omit<LLMChainInput, 'prompt'>): LLMChain {
    const taskCreationTemplate = `You are a task creation AI that uses the result of an execution agent
      to create new tasks with the following objective: {objective}
      The last completed task has the result: {result}.
      This result was based on this task description: {task_description}.
      These are incomplete tasks: {incomplete_tasks}.
      Based on the result, create new tasks to be completed
      by the AI system that do not overlap with incomplete tasks.
      Task must be answered in {language}.
      Return the tasks as an array.`;
    const prompt = new PromptTemplate({
      template: taskCreationTemplate,
      inputVariables: [
        'result',
        'task_description',
        'incomplete_tasks',
        'objective',
        'language',
      ],
    });
    return new TaskCreationChain({ prompt, ...fields });
  }
}
