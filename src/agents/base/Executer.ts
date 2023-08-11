import { AgentMessage, AgentTask } from '@/types';
import { Printer } from '@/utils/elf/print';

export class Executer {
  objective: string;
  modelName: string;
  handlers: {
    handleMessage: (message: AgentMessage) => Promise<void>;
    handleEnd: () => Promise<void>;
  };
  language: string;
  verbose: boolean;

  printer: Printer;
  taskList: AgentTask[] = [];

  constructor(
    objective: string,
    modelName: string,
    handlers: {
      handleMessage: (message: AgentMessage) => Promise<void>;
      handleEnd: () => Promise<void>;
    },
    language: string = 'en',
    varbose: boolean = false,
  ) {
    this.objective = objective;
    this.modelName = modelName;
    this.handlers = handlers;
    this.language = language;
    this.verbose = varbose;
    this.printer = new Printer(this.handlers.handleMessage, this.verbose);
  }

  async run() {
    this.taskList = [];
    await this.prepare();
    await this.loop();
    await this.finishup();
  }

  // prepare() is called before loop()
  async prepare() {
    this.printer.printObjective(this.objective);
  }

  async loop() {}

  async finishup() {
    // Objective completed
    this.printer.printAllTaskCompleted();
    this.handlers.handleEnd();
  }
}
