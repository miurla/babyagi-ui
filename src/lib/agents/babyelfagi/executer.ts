import { AgentMessage, TaskOutputs } from '@/types'; // You need to define these types
import { AgentExecuter } from '../base/AgentExecuter';
import { SkillRegistry, TaskRegistry } from './registory';
import { v4 as uuidv4 } from 'uuid';

const REFLECTION = false; // If you want to use reflection, set this to true. now support only client side reflection.

export class BabyElfAGI extends AgentExecuter {
  skillRegistry: SkillRegistry;
  taskRegistry: TaskRegistry;
  sessionSummary: string = '';

  constructor(
    objective: string,
    modelName: string,
    handlers: {
      handleMessage: (message: AgentMessage) => Promise<void>;
      handleEnd: () => Promise<void>;
      handleError: (error: Error) => Promise<void>;
    },
    language: string = 'en',
    verbose: boolean = false,
    specifiedSkills: string[] = [],
    userApiKey?: string,
    signal?: AbortSignal,
  ) {
    super(objective, modelName, handlers, language, verbose, signal);

    signal?.addEventListener('abort', () => {
      this.verbose &&
        console.log('Abort signal received. Stopping execution...');
    });

    this.skillRegistry = new SkillRegistry(
      this.handlers.handleMessage,
      this.verbose,
      this.language,
      specifiedSkills,
      userApiKey,
      this.signal,
    );

    const useSpecifiedSkills = specifiedSkills.length > 0;
    this.taskRegistry = new TaskRegistry(
      this.language,
      this.verbose,
      useSpecifiedSkills,
      userApiKey,
      this.signal,
    );
  }

  async prepare() {
    await super.prepare();

    const skillDescriptions = this.skillRegistry.getSkillDescriptions();
    const id = uuidv4();
    // Create task list
    try {
      await this.taskRegistry.createTaskList(
        id,
        this.objective,
        skillDescriptions,
        this.modelName,
        this.handlers.handleMessage,
      );
    } catch (error) {
      console.error(error);
      this.handlers.handleError(error as Error);
      return;
    }

    this.printer.printTaskList(this.taskRegistry.tasks, id);
  }

  async loop() {
    // Initialize task outputs
    let taskOutputs: TaskOutputs = {};
    for (let task of this.taskRegistry.tasks) {
      taskOutputs[task.id] = { completed: false, output: undefined };
    }
    // Loop until all tasks are completed
    while (
      !this.signal?.aborted &&
      !Object.values(taskOutputs).every((task) => task.completed)
    ) {
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

        let output = '';
        try {
          output = await this.taskRegistry.executeTask(
            i,
            task,
            taskOutputs,
            this.objective,
            this.skillRegistry,
            this.modelName,
          );
        } catch (error) {
          console.error(error);
          return;
        }

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
    if (this.signal?.aborted) return;
    const tasks = this.taskRegistry.getTasks();
    if (tasks.length === 0) return;

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

  async close() {}
}
