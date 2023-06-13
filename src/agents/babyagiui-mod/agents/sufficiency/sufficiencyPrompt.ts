// sufficiencyPrompt.ts //
import { AgentTask } from '@/types';
import { getTaskById } from '@/utils/task';
import { PromptTemplate } from 'langchain/prompts';

export const sufficiencyPrompt = (
  taskList: AgentTask[],
  task: AgentTask,
  taskResult: string,
) => {
  let taskPrompt = `Determine if the task results are sufficient based on the tasks completed by the task execution agent and the task results. Your objective: {objective}. Your task: {task}. Your task result: ${taskResult}`;
  if (task.dependentTaskIds) {
    let dependentTasksOutput = '';
    for (const id of task.dependentTaskIds) {
      const dependentTasks = getTaskById(taskList, id);
      const dependentTaskOutput = dependentTasks?.output?.slice(0, 2000);
      dependentTasksOutput += dependentTaskOutput;
    }
    taskPrompt += `Your dependent task output: ${dependentTasksOutput.slice(
      0,
      2000,
    )}\n OUTPUT:`;
  }

  taskPrompt += `\n\nIf the status is set to complete, update_task should be "". Depending on the reason and nature of the error, update the task so that the next task can be completed. Please provide your output in a similar format. Never add other keys. Here's a sample output format:\n\n
  result: {{ "status": "incomplete", "reason": "Insufficient information", "updated_task": "Latest Premier League updates"}}\n\n
  result: {{ "status": "complete", "reason": "Sufficient information", "updated_task": ""}}\n\n
  result:`;

  const prompt = new PromptTemplate({
    inputVariables: ['objective', 'task'],
    template: taskPrompt,
  });

  return prompt;
};
