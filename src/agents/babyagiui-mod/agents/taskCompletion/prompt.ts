import { AgentTask } from '@/types';
import { getTaskById } from '@/utils/task';
import { PromptTemplate } from 'langchain/prompts';

export const taskCompletionPrompt = (
  taskList: AgentTask[],
  task: AgentTask,
) => {
  let taskPrompt = `Complete your assigned task based on the objective and only based on information provided in the dependent task output, if provided. Your objective: {objective}. Your task: {task}`;
  if (task.dependentTaskIds) {
    let dependentTasksOutput = '';
    for (const id of task.dependentTaskIds) {
      const dependentTasks = getTaskById(taskList, id);
      const dependentTaskOutput = dependentTasks?.output?.slice(0, 2000);
      dependentTasksOutput += dependentTaskOutput;
    }
    taskPrompt += `Your dependent task output: ${dependentTasksOutput}\n OUTPUT:`;
  }

  const prompt = new PromptTemplate({
    inputVariables: ['objective', 'task'],
    template: taskPrompt,
  });

  return prompt;
};
