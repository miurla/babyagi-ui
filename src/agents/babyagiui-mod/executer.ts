import { AgentExecuter } from '../base/AgentExecuter';
import { taskCompletionAgent } from './agents/taskCompletion/agent';
import { taskCreationAgent } from './agents/taskCreation/agent';
import { AgentTask } from '@/types';
import { getTaskById } from '@/utils/task';
import { webBrowsing } from './tools/webBrowsing';
import { sufficiencyAgent } from './agents/sufficiency/sufficiencyAgent';
import { setupMessage } from '@/utils/message';
import { translate } from '@/utils/translate';

export class BUIExecuter extends AgentExecuter {
  // Create task list by agent
  async taskCreation() {
    this.abortController = new AbortController();
    this.taskList =
      (await taskCreationAgent(
        this.objective,
        this.modelName,
        this.language,
        this.abortController?.signal,
        this.statusCallback,
      )) ?? [];

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
            this.isRunningRef,
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

    if (!this.isRunningRef.current) return;

    // Execute the task
    this.statusCallback({ type: 'executing' });
    this.printer.printNextTask(task);
    const taskOutput = await this.taskOutputWithTool(task);

    if (!this.isRunningRef.current) return;

    // print the task output
    this.printer.printTaskOutput(taskOutput, task);

    if (!this.isRunningRef.current) return;

    this.statusCallback({ type: 'sufficiency' });
    // Sufficiency agent
    const sufficiencyResult = await sufficiencyAgent(
      task,
      this.taskList,
      taskOutput,
      this.objective,
      this.modelName,
      this.abortController?.signal,
    );

    if (!this.isRunningRef.current) return;

    // Find the task index in the task list
    const taskIndex = this.taskList.findIndex((t) => t.id === task.id);

    if (sufficiencyResult?.status === 'incomplete') {
      // If the task is not complete, update the output
      this.taskList[taskIndex].task =
        sufficiencyResult?.updated_task ?? task.task;
      this.retryCounter += 1;
    } else {
      // Matk task as complete and update the output
      this.taskList[taskIndex].status = 'complete';
      this.taskList[taskIndex].output = taskOutput;
      this.retryCounter = 0;
    }

    const icon = sufficiencyResult?.status === 'complete' ? '🙆‍♂️' : '🙅‍♀️';
    const retry =
      this.retryCounter > 0 ? ` (🔁 RetryCount: ${this.retryCounter - 1})` : '';
    this.messageCallback(
      setupMessage(
        'sufficiency-result',
        '```json\n' + JSON.stringify(sufficiencyResult) + '\n```\n' + retry,
        undefined,
        icon,
      ),
    );
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
      this.isRunningRef.current &&
      this.taskList.some((task) => task.status === 'incomplete')
    ) {
      if (!this.isRunningRef.current) {
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

      // Failed to complete the task
      if (this.retryCounter > 3) {
        const message = translate('TASK_FAILED_MESSAGE', 'message');
        this.messageCallback(setupMessage('failed', message));
        this.stop();
        break;
      }

      if (!this.isRunningRef.current) {
        break;
      }

      this.taskIdCounter += 1;
      this.statusCallback({ type: 'closing' });
      this.printer.printTaskList(this.taskList);
    }
  }
}
