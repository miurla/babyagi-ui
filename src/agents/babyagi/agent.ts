import { v4 as uuidv4 } from 'uuid';
import { Message, MessageStatus, UserSettings } from '@/types';
import { setupMessage } from '@/utils/message';
import {
  executionAgent,
  prioritizationAgent,
  taskCreationAgent,
} from './service';
import { SETTINGS_KEY } from '@/utils/constants';

export interface Task {
  taskID: string;
  taskName: string;
}

export class BabyAGI {
  objective: string;
  modelName: string;
  maxIterations: number;
  firstTask: string;
  verbose: boolean;
  taskList: Task[];
  taskIDCounter: number;
  messageCallback: (message: Message) => void;
  statusCallback: (status: MessageStatus) => void;
  cancel: () => void;
  isRunning: boolean;
  tableName: string;
  namespace?: string;

  constructor(
    objective: string,
    modelName: string,
    maxIterations: number,
    firstTask: string,
    messageCallback: (message: Message) => void,
    statusCallback: (status: MessageStatus) => void,
    cancel: () => void,
    verbose: boolean = false,
  ) {
    this.objective = objective;
    this.modelName = modelName;
    this.maxIterations = maxIterations;
    this.firstTask = firstTask;
    this.verbose = verbose;
    this.taskList = [];
    this.taskIDCounter = 1;
    this.cancel = cancel;
    this.messageCallback = messageCallback;
    this.statusCallback = statusCallback;
    this.isRunning = false;
    this.tableName =
      process.env.NEXT_PUBLIC_TABLE_NAME ?? 'baby-agi-test-table';
    this.namespace =
      process.env.NEXT_PUBLIC_USE_USER_API_KEY === 'true'
        ? uuidv4()
        : undefined;
  }

  printObjective() {
    this.messageCallback(setupMessage('objective', this.objective));

    if (!this.verbose) return;
    console.log(
      '%c*****OBJECTIVE*****%c\n%s',
      'color:blue',
      '',
      this.objective,
    );
  }

  printGPT4Alert() {
    if (this.modelName !== 'gpt-4') return;
    console.log(
      '%c*****USING GPT-4. POTENTIALLY EXPENSIVE. MONITOR YOUR COSTS*****%c',
      'color:red',
      '',
    );
  }

  printTaskList() {
    if (!this.isRunning) return;

    let tasks = '';
    for (const t of this.taskList) {
      tasks += `${t.taskID}. ${t.taskName}\n`;
    }
    this.messageCallback(setupMessage('task-list', tasks));

    if (!this.verbose) return;
    console.log('%c*****TASK LIST*****%c', 'color:fuchsia', '');
    console.log(tasks);
  }

  printNextTask(task: Task) {
    if (!this.isRunning) return;
    this.messageCallback(
      setupMessage('next-task', `${task.taskID}. ${task.taskName}`),
    );

    if (!this.verbose) return;
    console.log('%c*****NEXT TASK*****%c', 'color:green', '');
    console.log(`${task.taskID}. ${task.taskName}`);
  }

  printTaskResult(result: string) {
    if (!this.isRunning) return;
    this.messageCallback(setupMessage('task-result', result.trim()));

    if (!this.verbose) return;
    console.log('%c*****TASK RESULT*****%c', 'color:orange', '');
    console.log(result.trim());
  }

  getUserApiKey() {
    const item = localStorage.getItem(SETTINGS_KEY);

    if (!item) {
      return undefined;
    }

    const settings = JSON.parse(item) as UserSettings;
    const openAIApiKey = settings?.openAIApiKey ?? undefined;

    return openAIApiKey;
  }

  async executeTask(objective: string, taskName: string) {
    const userApiKey = this.getUserApiKey();

    if (userApiKey) {
      const context = await this.getContext(objective, taskName);
      return await executionAgent(
        objective,
        taskName,
        context,
        this.modelName,
        userApiKey,
      );
    }

    const response = await fetch('/api/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        objective,
        task: taskName,
        table_name: this.tableName,
        model_name: this.modelName,
      }),
    });

    return response.json().then((data) => data.response);
  }

  async taskCreation(
    objective: string,
    result: string,
    taskDescription: string,
  ) {
    const taskNames = this.taskList.map((task) => task.taskName).join(', ');
    const userApiKey = this.getUserApiKey();

    if (userApiKey) {
      return await taskCreationAgent(
        taskDescription,
        taskNames,
        result,
        objective,
        this.modelName,
        userApiKey,
      );
    }

    const response = await fetch('/api/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        objective,
        result: result,
        task_description: taskDescription,
        incomplete_tasks: taskNames,
        model_name: this.modelName,
      }),
    });

    return response.json().then((data) => data.response);
  }

  async taskPrioritization(objective: string, taskID: number) {
    const taskNames = this.taskList.map((t) => t.taskName).join(', ');
    const nextTaskID = taskID + 1;
    const userApiKey = this.getUserApiKey();

    if (userApiKey) {
      return await prioritizationAgent(
        objective,
        nextTaskID,
        taskNames,
        this.modelName,
        userApiKey,
      );
    }

    const response = await fetch('/api/prioritize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        objective,
        task_id: nextTaskID,
        task_names: taskNames,
        model_name: this.modelName,
      }),
    });

    return response.json().then((data) => data.response);
  }

  async enrich(task: Task, result: string, index: string) {
    const response = await fetch('/api/enrich', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task,
        result,
        index,
        namespace: this.namespace,
      }),
    });

    return response.json().then((data) => data.response);
  }

  // only used for client-side execution
  async getContext(objective: string, taskName: string) {
    const response = await fetch('/api/context', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        objective,
        task: taskName,
        table_name: this.tableName,
        model_name: this.modelName,
        namespace: this.namespace,
      }),
    });

    return response.json().then((data) => data.response);
  }

  async addTask(taskID: string, taskName: string) {
    this.taskList.push({ taskID, taskName });
  }

  async stop() {
    this.isRunning = false;
    this.cancel();
  }

  async run() {
    this.printGPT4Alert();
    this.printObjective();

    this.taskList = [];
    this.taskIDCounter = 1;
    this.isRunning = true;
    await this.addTask('1', this.firstTask);

    // Execute the loop
    await this.loop();

    if (!this.isRunning) {
      this.statusCallback('finished');
      return;
    }

    // Finish up
    this.statusCallback('finished');
    this.messageCallback(setupMessage('end-of-iterations', ''));
    this.isRunning = false;
    this.cancel();
  }

  async loop() {
    let iteration = 0;
    while (this.maxIterations === 0 || iteration < this.maxIterations) {
      if (!this.isRunning) {
        break;
      }

      if (this.taskList.length > 0) {
        this.printTaskList();

        // Step 1: Pull the first task
        this.statusCallback('preparing');
        const task = this.taskList.shift()!;
        this.printNextTask(task);

        // Send to execution function to complete the task based on the context
        this.statusCallback('executing');
        const result = await this.executeTask(this.objective, task.taskName);
        const taskID = parseInt(task.taskID, 10);
        this.printTaskResult(result);

        // Step 2: Enrich the result and store in Pinecone
        // TODO: taskEnrichment
        this.statusCallback('saving');
        await this.enrich(task, result, 'baby-agi-test-table');

        if (!this.isRunning) break;

        // Step 3: Create new tasks and reprioritize the task list
        this.statusCallback('creating');
        const newTasks = await this.taskCreation(
          this.objective,
          result,
          task.taskName,
        );
        for (const task of newTasks) {
          this.taskIDCounter += 1;
          task.taskID = this.taskIDCounter.toFixed();
          await this.addTask(task.taskID, task.taskName);
        }

        if (!this.isRunning) break;

        this.statusCallback('prioritizing');
        this.taskList = await this.taskPrioritization(this.objective, taskID);

        // console.log('iteration: ', iteration);

        iteration++;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Sleep before checking the task list again
    }
  }
}
