import { AgentTask, Message } from '@/types';
import { getToolIcon, setupMessage } from './message';

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
    console.log('%c*****OBJECTIVE*****\n\n%c', 'color:fuchsia', '');
  }

  printNextTask(task: AgentTask) {
    const nextTask = `${task.id}. ${task.task} - **[${getToolIcon(task.tool)} ${
      task.tool
    }]**`;
    this.messageCallback(setupMessage('next-task', nextTask));

    if (!this.verbose) return;
    console.log('%c*****NEXT TASK*****\n\n%c', 'color:fuchsia', '');
    console.log(task);
  }

  printTaskList(taskList: AgentTask[]) {
    let message =
      '| ID | Status | Task  | Tool | Dependency | \n | :-: | :-: | - | :-: | :-: | \n';
    taskList.forEach((task) => {
      const dependentTask = task.dependentTaskIds
        ? `${task.dependentTaskIds.join(', ')}`
        : '-';
      const status = task.status === 'complete' ? '✅' : '⬜️';
      message += `| ${task.id} | ${status} | ${task.task} | ${getToolIcon(
        task.tool,
      )} | ${dependentTask} |\n`;
    });

    this.messageCallback(setupMessage('task-list', message));

    if (!this.verbose) return;
    console.log('%c*****TASK LIST*****\n\n%c', 'color:fuchsia', '');
    console.log(message);
  }

  printTaskOutput(output: string, task: AgentTask) {
    if (task.tool !== 'text-completion') {
      // code block for non-text-completion tools
      output = '```\n' + output + '\n```';
    }
    this.messageCallback(setupMessage('task-output', output, task?.tool));

    if (!this.verbose) return;
    console.log('%c*****TASK OUTPUT*****\n\n%c', 'color:fuchsia', '');
    console.log(output);
  }

  printTaskCompleted() {
    this.messageCallback(setupMessage('done', 'Done!'));

    if (!this.verbose) return;
    console.log('%c*****DONE*****\n\n%c', 'color:fuchsia', '');
  }

  printAllTaskCompleted() {
    this.messageCallback(setupMessage('complete', 'All tasks completed!'));

    if (!this.verbose) return;
    console.log('%c*****ALL TASK COMPLETED*****\n\n%c', 'color:fuchsia', '');
  }
}
