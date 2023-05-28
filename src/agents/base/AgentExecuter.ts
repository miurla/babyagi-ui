import { AgentStatus, AgentTask, Message } from '@/types';
import { Printer } from '@/utils/print';

export class AgentExecuter {
  objective: string;
  modelName: string;
  messageCallback: (message: Message) => void;
  statusCallback: (status: AgentStatus) => void;
  cancelCallback: () => void;
  verbose: boolean = false;
  //
  taskIdCounter: number = 0;
  taskList: AgentTask[] = [];
  isRunning: boolean = false;
  //
  abortController?: AbortController;
  printer: Printer;

  constructor(
    objective: string,
    modelName: string,
    messageCallback: (message: Message) => void,
    statusCallback: (status: AgentStatus) => void,
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
      this.statusCallback({ type: 'finished' });
      return;
    }

    // Objective completed
    this.printer.printAllTaskCompleted();
    this.statusCallback({ type: 'finished' });
    this.cancelCallback();
    this.isRunning = false;
  }

  // prepare() is called before loop()
  async prepare() {
    this.printer.printObjective(this.objective);
  }
  async loop() {}
}
