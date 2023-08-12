import { Executer } from './Executer';
import { AgentMessage } from '@/types/index';

export class TestExecuter extends Executer {
  constructor(
    objective: string,
    modelName: string,
    handlers: {
      handleMessage: (message: AgentMessage) => Promise<void>;
      handleEnd: () => Promise<void>;
    },
    language: string = 'en',
  ) {
    super(objective, modelName, handlers, language);
  }

  // Override any methods if needed
  async loop(): Promise<void> {
    const tasks = [];
    for (let i = 0; i < 3; i++) {
      const task = new Promise<void>((resolve) => {
        setTimeout(async () => {
          const id = `task + ${i}`;
          await this.handlers.handleMessage({
            content: `Test message ${i}`,
            title: `Task description ${i}`,
            type: 'task',
            taskId: `${i}`,
            id,
          });
          resolve();
        }, 1000 * i);
      });
      tasks.push(task);
    }
    await Promise.all(tasks);
  }
}
