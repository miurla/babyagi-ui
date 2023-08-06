import { AgentMessage, AgentTask } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class Executer {
  objective: string;
  modelName: string;
  handlers: {
    handleMessage: (message: AgentMessage) => Promise<void>;
    handleEnd: () => Promise<void>;
  };
  language: string;

  taskList: AgentTask[] = [];

  constructor(
    objective: string,
    modelName: string,
    handlers: {
      handleMessage: (message: AgentMessage) => Promise<void>;
      handleEnd: () => Promise<void>;
    },
    language: string = 'en',
  ) {
    this.objective = objective;
    this.modelName = modelName;
    this.handlers = handlers;
    this.language = language;
  }

  async run() {
    this.taskList = [];
    await this.prepare();
    await this.loop();
    await this.finishup();
  }

  // prepare() is called before loop()
  async prepare() {
    this.handleMessage({
      content: `objective: ${this.objective}`,
      type: 'objective',
    });
  }

  async loop() {
    const tasks = [];
    for (let i = 0; i < 3; i++) {
      const task = new Promise<void>((resolve) => {
        setTimeout(async () => {
          await this.handleMessage({
            content: `Test message ${i}`,
            type: 'test',
          });
          resolve();
        }, 1000 * i);
      });
      tasks.push(task);
    }
    await Promise.all(tasks);
  }

  async finishup() {
    // Objective completed
    this.handlers.handleMessage({
      content: 'Objective completed',
      type: 'finish',
    });
    this.handlers.handleEnd();
  }

  // handleMessage() is called by the agent to send a message to the frontend
  async handleMessage(message: AgentMessage) {
    const msg = {
      ...message,
      id: message.id || uuidv4(),
    };
    await this.handlers.handleMessage(message);
  }
}
