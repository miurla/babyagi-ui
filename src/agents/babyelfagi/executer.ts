import { AgentStatus, Message, TaskOutputs } from '@/types'; // You need to define these types
import { AgentExecuter } from '../base/AgentExecuter';
import { SkillRegistry, TaskRegistry } from './registory';
import { translate } from '@/utils/translate';

const REFLECTION = false; // If you want to use reflection, set this to true. now support only client side reflection.

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

    this.abortController = new AbortController();
    this.skillRegistry = new SkillRegistry(
      this.messageCallback,
      this.abortController,
      this.isRunningRef,
      verbose,
      this.language,
    );
    this.taskRegistry = new TaskRegistry(this.verbose);
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
      'gpt-4', // Culletly using GPT-4
      this.messageCallback,
      this.abortController,
      this.language,
    );
    this.printer.printTaskList(this.taskRegistry.tasks, 0);
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
    this.messageCallback({
      type: 'final-result',
      text: lastTask.result ?? '',
      title: translate('FINAL_TASK_RESULT', 'message'),
      icon: '✍️',
      id: 9999,
    });

    this.messageCallback({
      type: 'session-summary',
      text: this.sessionSummary,
      id: 9999,
    });

    super.finishup();
  }

  currentStatusCallback = () => {
    const tasks = this.taskRegistry.getTasks();
    const ids = tasks.filter((t) => t.status === 'running').map((t) => t.id);
    this.statusCallback({
      type: 'executing',
      message: `(👉 ${ids.join(', ')} / ${tasks.length})`,
    });
  };
}
