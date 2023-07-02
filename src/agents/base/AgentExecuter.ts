import { AgentStatus, AgentTask, Message } from '@/types';
import { Printer } from '@/utils/print';

export class AgentExecuter {
  objective: string;
  modelName: string;
  messageCallback: (message: Message) => void;
  statusCallback: (status: AgentStatus) => void;
  cancelCallback: () => void;
  language: string = 'en';
  verbose: boolean = false;

  taskIdCounter: number = 0;
  retryCounter: number = 0;
  taskList: AgentTask[] = [];
  isRunningRef = { current: false };

  abortController?: AbortController;
  printer: Printer;

  constructor(
    objective: string,
    modelName: string,
    messageCallback: (message: Message) => void,
    statusCallback: (status: AgentStatus) => void,
    cancelCallback: () => void,
    language: string = 'en',
    verbose: boolean = false,
  ) {
    this.objective = objective;
    this.modelName = modelName;
    this.messageCallback = messageCallback;
    this.statusCallback = statusCallback;
    this.cancelCallback = cancelCallback;
    this.language = language;
    this.verbose = verbose;
    this.printer = new Printer(messageCallback, verbose);
  }

  async start() {
    this.isRunningRef.current = true;
    this.taskIdCounter = 0;
    this.retryCounter = 0;
    this.taskList = [];
    await this.prepare();
    await this.loop();
    await this.finishup();
  }

  async stop() {
    this.isRunningRef.current = false;
    this.cancelCallback();
    this.abortController?.abort();
  }

  async finishup() {
    if (!this.isRunningRef.current) {
      this.statusCallback({ type: 'finished' });
      return;
    }

    // Objective completed
    this.printer.printAllTaskCompleted();
    this.statusCallback({ type: 'finished' });
    this.cancelCallback();
    this.isRunningRef.current = false;
  }

  // prepare() is called before loop()
  async prepare() {
    this.printer.printObjective(this.objective);
  }
  async loop() {}

  async userInput(taskId: number, message: string) {}
}
