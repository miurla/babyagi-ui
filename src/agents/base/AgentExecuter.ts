import { AgentStatus, AgentTask, Message } from '@/types';
import { Printer } from '@/utils/print';

export class AgentExecuter {
  objective: string;
  modelName: string;
  messageCallback: (message: Message) => void;
  statusCallback: (status: AgentStatus, taskId?: number | string | undefined | null) => void;
  cancelCallback: () => void;
  verbose: boolean = false;

  taskIdCounter: number = 0;
  taskList: AgentTask[] = [];
  isRunning!: boolean | string;

  abortController?: AbortController;
  printer: Printer;

  constructor(
    objective: string,
    modelName: string,
    messageCallback: (message: Message) => void,
    statusCallback: (status: AgentStatus, taskId?: number | string | undefined | null) => void,
    cancelCallback: () => void,
    verbose: boolean = false,
  ) {
    this.objective = objective;
    this.modelName = modelName;
    this.messageCallback = messageCallback;
    this.statusCallback = statusCallback;
    this.cancelCallback = cancelCallback;
    this.verbose = verbose;
    this.printer = new Printer(messageCallback, verbose);
  }

  async start() {
    this.isRunning = true;
    this.taskIdCounter = 0;
    this.taskList = [];
    await this.prepare();
    await this.loop();
    await this.finishup();
  }

  async stop() {
    this.isRunning = false;
    this.cancelCallback();
    this.abortController?.abort();
  }

  async finishup() {
    if (!this.isRunning) {
      this.statusCallback({ type: 'finished', taskId: null });
      return;
    }

    // Objective completed
    this.printer.printAllTaskCompleted();
    this.statusCallback({ type: 'finished' });
    this.cancelCallback();
    this.isRunning = false;
  }

  async prepare() {
    this.printer.printObjective(this.objective);
  }

  async loop() {
    while (this.isRunning && this.taskList.length > 0) {
      const currentTask = this.taskList.shift();
      if (currentTask) {
        await this.executeTask(currentTask);
      }
    }

  }

  async executeTask(task: AgentTask) {
    this.statusCallback({ type: 'task-started', taskId: task?.id });

    switch (task.task) {
      case 'type1':
        break;
      case 'type2':
        break;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.statusCallback({ type: 'task-completed', taskId: task?.id });
  }

  addTask(task: AgentTask) {
    this.taskList.push(task);
  }

  removeTask(taskId: number) {
    this.taskList = this.taskList.filter((task) => task.id !== taskId);
  }

  clearTasks() {
    this.taskList = [];
  }

  getRemainingTasksCount(): number {
    return this.taskList.length;
  }

  getStatus(): AgentStatus {
    if (this.isRunning) {
      return { type: 'running' };
    } else {
      return { type: 'finished' };
    }
  }
}
