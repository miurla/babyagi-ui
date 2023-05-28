import { AgentExecuter } from '../base/AgentExecuter';
import { taskCompletionAgent } from './agents/taskCompletion/agent';
import { taskCreationAgent } from './agents/taskCreation/agent';
import { AgentTask } from '@/types';
import { getTaskById } from '@/utils/task';
import { webBrowsing } from './tools/webBrowsing';

export class BUIExecuter extends AgentExecuter {
  // Create task list by agent
  async taskCreation() {
    this.abortController = new AbortController();
    this.taskList =
      (await taskCreationAgent(
        this.objective,
        this.modelName,
        this.abortController?.signal,
        this.statusCallback,
      )) ?? [];
    if (this.taskList.length === 0) {
      throw new Error('Task list is empty');
    }

    this.printer.printTaskList(this.taskList);
  }

  async taskOutputWithTool(task: AgentTask) {
    let taskOutput = '';
    switch (task.tool) {
      case 'text-completion':
        this.abortController = new AbortController();
        taskOutput = await taskCompletionAgent(
          task,
          this.taskList,
          this.objective,
          this.modelName,
          this.abortController?.signal,
          this.statusCallback,
        );
        break;
      case 'web-search':
        taskOutput =
          (await webBrowsing(
            this.objective,
            task,
            this.messageCallback,
            this.statusCallback,
            this.isRunning,
            this.verbose,
            this.abortController?.signal,
          )) ?? '';
        break;
      default:
        break;
    }
    return taskOutput;
  }

  async executeTask(task: AgentTask) {
    // Check if dependent task id is not empty
    if (task.dependentTaskIds) {
      let allDependentTasksCompleted = true;
      for (const id of task.dependentTaskIds) {
        const dependentTask = getTaskById(this.taskList, id);
        if (dependentTask?.status !== 'complete') {
          allDependentTasksCompleted = false;
          break;
        }
      }
    }

    if (!this.isRunning) return;

    // Execute the task
    this.statusCallback({ type: 'executing' });
    this.printer.printNextTask(task);
    const taskOutput = await this.taskOutputWithTool(task);

    // Find the task index in the task list
    const taskIndex = this.taskList.findIndex((t) => t.id === task.id);

    // Matk task as complete and update the output
    this.taskList[taskIndex].status = 'complete';
    this.taskList[taskIndex].output = taskOutput;

    // print the task output
    this.printer.printTaskOutput(taskOutput, task);
  }

  // Override AgentExecuter
  async prepare() {
    super.prepare();
    // 1. Create task list
    await this.taskCreation();
  }

  async loop() {
    // Continue the loop while there are incomplete tasks
    while (
      this.isRunning &&
      this.taskList.some((task) => task.status === 'incomplete')
    ) {
      if (!this.isRunning) {
        break;
      }

      this.statusCallback({ type: 'preparing' });

      const incompleteTasks = this.taskList.filter(
        (task) => task.status === 'incomplete',
      );
      // Pull the first incomplete task
      const task = incompleteTasks[0];
      // 2. Execute the task
      await this.executeTask(task);

      this.taskIdCounter += 1;
      this.statusCallback({ type: 'closing' });
      this.printer.printTaskList(this.taskList);
    }
  }
}
