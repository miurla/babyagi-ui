import { AgentStatus, AgentTask, Message, TaskOutputs } from '@/types'; // You need to define these types

import { AgentExecuter } from '../base/AgentExecuter';
import { SkillRegistry, TaskRegistry } from './registory';
import { Configuration, textCompletion, webSearch } from './skills';
import { Skill } from './skills/skill';
import { getUserApiKey } from '@/utils/settings';

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

    const skillClasses: (typeof Skill)[] = [textCompletion, webSearch]; // You need to define these skills
    const apiKeys = { openai: getUserApiKey() || '' };
    const config = new Configuration({ skillClasses, apiKeys });
    this.abortController = new AbortController();
    this.skillRegistry = new SkillRegistry(
      config,
      this.messageCallback,
      this.abortController,
      this.isRunningRef,
      verbose,
    );
    this.taskRegistry = new TaskRegistry();
    this.sessionSummary = '';
  }

  async prepare() {
    await super.prepare();

    const skillDescriptions = this.skillRegistry.getSkillDescriptions();
    this.abortController = new AbortController();
    this.statusCallback({ type: 'creating' });
    await this.taskRegistry.createTaskList(
      this.objective,
      skillDescriptions,
      this.messageCallback,
      this.abortController,
    );
    this.printer.printTaskList(this.taskRegistry.tasks);
  }

  async loop() {
    // Initialize task outputs
    let taskOutputs: TaskOutputs = {};
    for (let task of this.taskRegistry.tasks) {
      taskOutputs[task.id] = { completed: false, output: undefined };
    }

    // Loop until all tasks are completed
    while (!Object.values(taskOutputs).every((task) => task.completed)) {
      if (!this.isRunningRef.current) {
        break;
      }
      this.statusCallback({ type: 'preparing' });

      // Get the tasks that are ready to be executed
      const tasks = this.taskRegistry.getTasks();

      // Update taskOutputs to include new tasks
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        if (!(task.id in taskOutputs)) {
          taskOutputs[task.id] = { completed: false, output: undefined };
        }
      }

      // Filter tasks that have all their dependencies completed
      const MaxExecutableTasks = 5;
      const executableTasks = tasks
        .filter((task) => {
          if (!task.dependentTaskIds) return true;
          return task.dependentTaskIds.every((id) => {
            return taskOutputs[id]?.completed;
          });
        })
        .slice(0, MaxExecutableTasks);

      // Execute all executable tasks in parallel
      const taskPromises = executableTasks.map(async (task, i) => {
        // Update task status to running
        this.taskRegistry.updateTasks({
          id: task.id,
          updates: { status: 'running' },
        });
        this.printer.printTaskExecute(task);
        this.currentStatusCallback();
        const output = await this.taskRegistry.executeTask(
          i,
          task,
          taskOutputs,
          this.objective,
          this.skillRegistry,
        );

        taskOutputs[task.id] = { completed: true, output: output };
        this.taskRegistry.updateTasks({
          id: task.id,
          updates: { status: 'complete', result: output },
        });
        this.printer.printTaskOutput(output, task);

        // Reflect on the output of the tasks and possibly add new tasks or update existing ones
        if (REFLECTION) {
          //   let newTasks = this.taskRegistry.reflectOnOutput(output, '');
          //   for (let newTask of newTasks) {
          //     this.taskRegistry.addTask(newTask, 0);
          //   }
        }
      });

      // Wait for all tasks to complete
      await Promise.all(taskPromises);
    }
  }

  // // Save session summary to a file
  // fs.writeFileSync(
  //   `output/output_${new Date().toISOString()}.txt`,
  //   'summary',
  // );

  currentStatusCallback = () => {
    const tasks = this.taskRegistry.getTasks();
    const ids = tasks.filter((t) => t.status === 'running').map((t) => t.id);
    this.statusCallback({
      type: 'executing',
      message: `(👉 ${ids.join(', ')} / ${tasks.length})`,
    });
  };
}
