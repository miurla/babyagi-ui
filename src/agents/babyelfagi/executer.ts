import { AgentStatus, AgentTask, Message } from '@/types'; // You need to define these types
import { Printer } from '@/utils/print'; // You need to define this utility function

import { AgentExecuter } from '../base/AgentExecuter';
import { SkillRegistry, TaskRegistry } from './registory';
import { Configuration, TextCompletion } from './skills';
import { Skill } from './skills/skill';

const REFLECTION = false;

export class BabyElfAGI extends AgentExecuter {
  skillRegistry: SkillRegistry;
  taskRegistry: TaskRegistry;
  sessionSummary: string;

  constructor(
    objective: string,
    modelName: string,
    messageCallback: (message: Message) => void,
    statusCallback: (status: AgentStatus) => void,
    cancelCallback: () => void,
    language: string = 'en',
    verbose: boolean = false,
  ) {
    super(
      objective,
      modelName,
      messageCallback,
      statusCallback,
      cancelCallback,
      language,
      verbose,
    );

    const skillClasses: (typeof Skill)[] = [TextCompletion];
    const apiKeys = { openai: process.env.OPENAI_API_KEY || '' };
    const config = new Configuration({ skillClasses, apiKeys });
    this.skillRegistry = new SkillRegistry(config);
    this.taskRegistry = new TaskRegistry();
    this.sessionSummary = '';
  }

  async prepare() {
    await super.prepare();
    const skillDescriptions = this.skillRegistry.getSkillDescriptions();
    this.abortController = new AbortController();
    await this.taskRegistry.createTaskList(
      this.objective,
      skillDescriptions,
      this.messageCallback,
      this.abortController,
    );
    this.printer.printTaskList(this.taskRegistry.tasks);
  }

  async loop() {
    return;

    // Initialize task outputs
    let taskOutputs: { [id: number]: { completed: boolean; output: any } } = {};

    // Loop until all tasks are completed
    while (!Object.values(taskOutputs).every((task) => task.completed)) {
      // Get the tasks that are ready to be executed
      let tasks = this.taskRegistry.getTasks();

      // Update taskOutputs to include new tasks
      for (let i = 0; i < tasks.length; i++) {
        let task = tasks[i];
        if (!(task.id in taskOutputs)) {
          taskOutputs[task.id] = { completed: false, output: null };
        }
      }

      // Execute the tasks that are ready to be executed
      for (let i = 0; i < tasks.length; i++) {
        let task = tasks[i];
        if (taskOutputs[task.id].completed) continue;
        let output = await this.taskRegistry.executeTask(
          i,
          task,
          taskOutputs,
          this.objective,
        );
        taskOutputs[task.id] = { completed: true, output: output };
        this.taskRegistry.updateTasks({
          id: task.id,
          updates: { status: 'complete', result: output },
        });

        // Reflect on the output of the tasks and possibly add new tasks or update existing ones
        if (REFLECTION) {
          //   let newTasks = this.taskRegistry.reflectOnOutput(output, '');
          //   for (let newTask of newTasks) {
          //     this.taskRegistry.addTask(newTask, 0);
          //   }
        }
      }

      // Short delay to prevent busy looping
      setTimeout(() => {}, 100);
    }

    // // Save session summary to a file
    // fs.writeFileSync(
    //   `output/output_${new Date().toISOString()}.txt`,
    //   'summary',
    // );
  }
}
