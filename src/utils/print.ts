import { AgentTask, Message } from '@/types';
import { getToolIcon, setupMessage, setupMessageWithTask } from './message';

export class Printer {
  messageCallback: (message: Message) => void;
  verbose: boolean = false;

  constructor(
    messageCallback: (message: Message) => void,
    verbose: boolean = false,
  ) {
    this.messageCallback = messageCallback;
    this.verbose = verbose;
  }

  printObjective(objective: string) {
    this.messageCallback(setupMessage('objective', objective));

    if (!this.verbose) return;
    console.log('%c*****OBJECTIVE*****\n%c%s', 'color:fuchsia', '', objective);
  }

  printNextTask(task: AgentTask) {
    const nextTask = `${task.id}. ${task.task} - **[${getToolIcon(task.tool)} ${
      task.tool
    }]**`;
    this.messageCallback(
      setupMessage('next-task', nextTask, task.tool, undefined, task.id),
    );

    if (!this.verbose) return;
    console.log('%c*****NEXT TASK*****\n%c', 'color:fuchsia', '');
    console.log(task);
  }

  printTaskExecute(task: AgentTask) {
    this.messageCallback(setupMessageWithTask(task));

    if (!this.verbose) return;
    console.log('%c*****NEXT TASK*****\n%c', 'color:fuchsia', '');
    console.log(task);
  }

  printTaskList(taskList: AgentTask[], id?: number) {
    const useSkill = taskList[0].skill !== undefined;
    let message =
      '| ID | Status | Task  | Tool | Dependency | \n | :-: | :-: | - | :-: | :-: | \n';
    if (useSkill) {
      message =
        '| ID | Status | Task  | Skill | Dependency | \n | :-: | :-: | - | :-: | :-: | \n';
    }

    taskList.forEach((task) => {
      const dependentTask = task.dependentTaskIds
        ? `${task.dependentTaskIds.join(', ')}`
        : '-';
      const status = task.status === 'complete' ? '✅' : '⬜️';
      if (useSkill) {
        message += `| ${task.id} | ${status} | ${task.task} | ${task.icon} | ${dependentTask} |\n`;
        return;
      }
      message += `| ${task.id} | ${status} | ${task.task} | ${getToolIcon(
        task.tool,
      )} | ${dependentTask} |\n`;
    });

    this.messageCallback(
      setupMessage('task-list', message, undefined, `📝`, id),
    );

    if (!this.verbose) return;
    console.log('%c*****TASK LIST*****\n%c%s', 'color:fuchsia', '', message);
  }

  printTaskOutput(output: string, task: AgentTask) {
    if (task.tool !== 'text-completion') {
      // code block for non-text-completion tools
      // output = '```\n' + output + '\n```';
    }
    this.messageCallback(
      setupMessage('task-output', output, task?.tool, undefined, task?.id),
    );

    if (!this.verbose) return;
    console.log('%c*****TASK OUTPUT*****\n%c%s', 'color:fuchsia', '', output);
  }

  printTaskCompleted() {
    this.messageCallback(setupMessage('done', 'Done!'));

    if (!this.verbose) return;
    console.log('%c*****DONE*****\n%c', 'color:fuchsia', '');
  }

  printAllTaskCompleted() {
    this.messageCallback(setupMessage('complete', 'All tasks completed!'));

    if (!this.verbose) return;
    console.log('%c*****ALL TASK COMPLETED*****%c', 'color:fuchsia', '');
  }
}
