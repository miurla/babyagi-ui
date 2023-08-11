import { AgentStatus, AgentMessage, TaskOutputs } from '@/types'; // You need to define these types
import { Executer } from '../base/Executer';
import { SkillRegistry, TaskRegistry } from './registory';
import { translate } from '@/utils/translate';
import { v4 as uuidv4 } from 'uuid';

const REFLECTION = false; // If you want to use reflection, set this to true. now support only client side reflection.

export class BabyElfAGI extends Executer {
  skillRegistry: SkillRegistry;
  taskRegistry: TaskRegistry;
  sessionSummary: string = '';

  constructor(
    objective: string,
    modelName: string,
    handlers: {
      handleMessage: (message: AgentMessage) => Promise<void>;
      handleEnd: () => Promise<void>;
    },
    language: string = 'en',
    verbose: boolean = true,
  ) {
    super(objective, modelName, handlers, language);

    this.skillRegistry = new SkillRegistry(
      this.handlers.handleMessage,
      verbose,
      this.language,
    );
    this.taskRegistry = new TaskRegistry(this.language, this.verbose);
  }

  async prepare() {
    await super.prepare();

    const skillDescriptions = this.skillRegistry.getSkillDescriptions();
    const id = uuidv4();
    // Create task list
    await this.taskRegistry.createTaskList(
      id,
      this.objective,
      skillDescriptions,
      this.modelName, // Culletly using GPT-4
      this.handlers.handleMessage,
    );
    this.printer.printTaskList(this.taskRegistry.tasks, id);
  }

  async loop() {
    // Initialize task outputs
    let taskOutputs: TaskOutputs = {};
    for (let task of this.taskRegistry.tasks) {
      taskOutputs[task.id] = { completed: false, output: undefined };
    }

    // Loop until all tasks are completed
    while (!Object.values(taskOutputs).every((task) => task.completed)) {
      // this.handlers.handleMessage({ type: 'preparing' });

      // Get the tasks that are ready to be executed
      const tasks = this.taskRegistry.getTasks();

      // Update taskOutputs to include new tasks
      tasks.forEach((task) => {
        if (!(task.id in taskOutputs)) {
          taskOutputs[task.id] = { completed: false, output: undefined };
        }
      });

      // Filter taskoutput not completed
      const incompleteTasks = tasks.filter((task) => {
        return !taskOutputs[task.id].completed;
      });

      // Filter tasks that have all their dependencies completed
      const MaxExecutableTasks = 5;
      const executableTasks = incompleteTasks
        .filter((task) => {
          if (!task.dependentTaskIds) return true;
          return task.dependentTaskIds.every((id) => {
            return taskOutputs[id]?.completed === true;
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
        // this.currentStatusCallback();
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
        this.sessionSummary += `# ${task.id}: ${task.task}\n${output}\n\n`;

        // Reflect on the output of the tasks and possibly add new tasks or update existing ones
        if (REFLECTION) {
          const skillDescriptions = this.skillRegistry.getSkillDescriptions();
          const [newTasks, insertAfterIds, tasksToUpdate] =
            await this.taskRegistry.reflectOnOutput(
              this.objective,
              output,
              skillDescriptions,
            );

          // Insert new tasks
          for (let i = 0; i < newTasks.length; i++) {
            const newTask = newTasks[i];
            const afterId = insertAfterIds[i];
            this.taskRegistry.addTask(newTask, afterId);
          }

          // Update existing tasks
          for (const taskToUpdate of tasksToUpdate) {
            this.taskRegistry.updateTasks({
              id: taskToUpdate.id,
              updates: taskToUpdate,
            });
          }
        }
      });

      // Wait for all tasks to complete
      await Promise.all(taskPromises);
    }
  }

  async finishup() {
    const tasks = this.taskRegistry.getTasks();
    const lastTask = tasks[tasks.length - 1];
    this.handlers.handleMessage({
      type: 'result',
      content: lastTask.result ?? '',
      id: uuidv4(),
    });

    this.handlers.handleMessage({
      type: 'session-summary',
      content: this.sessionSummary,
      id: uuidv4(),
    });

    super.finishup();
  }
}
