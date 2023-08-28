import { AgentStatus, Message } from '@/types';
import { setupMessage } from '@/utils/message';
import { getUserApiKey } from '@/utils/settings';
import {
  executionAgent,
  prioritizationAgent,
  taskCreationAgent,
} from './service';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import axios from 'axios';

export interface Task {
  taskID: string;
  taskName: string;
}

export class BabyAGI {
  objective: string;
  modelName: string;
  maxIterations: number;
  firstTask: string;
  messageCallback: (message: Message) => void;
  statusCallback: (status: AgentStatus) => void;
  cancelCallback: () => void;
  verbose: boolean;
  taskList: Task[];
  taskIDCounter: number;
  isRunning: boolean;
  tableName: string;
  namespace?: string;
  abortController?: AbortController;
  language: string = 'en';

  constructor(
    objective: string,
    modelName: string,
    maxIterations: number,
    firstTask: string,
    id: string,
    messageCallback: (message: Message) => void,
    statusCallback: (status: AgentStatus) => void,
    cancel: () => void,
    language: string = 'en',
    verbose: boolean = false,
  ) {
    this.objective = objective;
    this.modelName = modelName;
    this.maxIterations = maxIterations;
    this.firstTask = firstTask;
    this.verbose = verbose;
    this.language = language;
    this.taskList = [];
    this.taskIDCounter = 1;
    this.cancelCallback = cancel;
    this.messageCallback = messageCallback;
    this.statusCallback = statusCallback;
    this.isRunning = false;
    this.tableName =
      process.env.NEXT_PUBLIC_TABLE_NAME ?? 'baby-agi-test-table';
    this.namespace =
      process.env.NEXT_PUBLIC_USE_USER_API_KEY === 'true' ? id : undefined;
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

  async executeTask(objective: string, taskName: string) {
    const userApiKey = getUserApiKey();

    // should request client side
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

    this.abortController = new AbortController();
    const response = await axios
      .post(
        '/api/execute',
        {
          objective,
          task: taskName,
          table_name: this.tableName,
          model_name: this.modelName,
        },
        {
          signal: this.abortController.signal,
        },
      )
      .catch((error) => {
        if (error.name === 'AbortError') {
          console.log('Request aborted', error.message);
        } else {
          console.log(error.message);
        }
      });

    return response?.data?.response;
  }

  async taskCreation(
    objective: string,
    result: string,
    taskDescription: string,
  ) {
    const taskNames = this.taskList.map((task) => task.taskName).join(', ');
    const userApiKey = getUserApiKey();

    // should request client side
    if (userApiKey) {
      return await taskCreationAgent(
        taskDescription,
        taskNames,
        result,
        objective,
        this.modelName,
        this.language,
        userApiKey,
      );
    }

    const response = await axios
      .post(
        '/api/create',
        {
          objective,
          result: result,
          task_description: taskDescription,
          incomplete_tasks: taskNames,
          model_name: this.modelName,
          language: this.language,
        },
        { signal: this.abortController?.signal },
      )
      .catch((error) => {
        if (error.name === 'AbortError') {
          console.log('Request aborted', error.message);
        } else {
          console.log(error.message);
        }
      });

    return response?.data?.response;
  }

  async taskPrioritization(objective: string, taskID: number) {
    const taskNames = this.taskList.map((t) => t.taskName).join(', ');
    const nextTaskID = taskID + 1;
    const userApiKey = getUserApiKey();

    // should request client side
    if (userApiKey) {
      return await prioritizationAgent(
        objective,
        nextTaskID,
        taskNames,
        this.modelName,
        userApiKey,
      );
    }

    const response = await axios
      .post(
        '/api/prioritize',
        {
          objective,
          task_id: nextTaskID,
          task_names: taskNames,
          model_name: this.modelName,
        },
        {
          signal: this.abortController?.signal,
        },
      )
      .catch((error) => {
        if (error.name === 'AbortError') {
          console.log('Request aborted', error.message);
        } else {
          console.log(error.message);
        }
      });

    return response?.data?.response;
  }

  async enrich(task: Task, result: string, index: string) {
    const userApiKey = getUserApiKey();
    let values: number[] | undefined = undefined;

    // should request client side
    if (userApiKey) {
      const embedding = await new OpenAIEmbeddings({
        openAIApiKey: userApiKey,
      });
      values = (await embedding.embedDocuments([result]))[0] ?? [];
    }

    const response = await axios
      .post(
        '/api/enrich',
        {
          task,
          result,
          index,
          namespace: this.namespace,
          vector_values: values,
        },
        {
          signal: this.abortController?.signal,
        },
      )
      .catch((error) => {
        if (error.name === 'AbortError') {
          console.log('Request aborted', error.message);
        } else {
          console.log(error.message);
        }
      });

    return response?.data?.response;
  }

  // only used for client-side openai api requests
  async getContext(objective: string, taskName: string) {
    const userApiKey = getUserApiKey() ?? undefined;

    if (!userApiKey) {
      throw new Error('OpenAI API key not found');
    }

    const embedding = await new OpenAIEmbeddings({
      openAIApiKey: userApiKey,
    });
    const queryEmbedding = await embedding.embedQuery(objective);
    const response = await axios
      .post(
        '/api/context',
        {
          objective,
          task: taskName,
          table_name: this.tableName,
          model_name: this.modelName,
          namespace: this.namespace,
          query_embedding: queryEmbedding,
        },
        {
          signal: this.abortController?.signal,
        },
      )
      .catch((error) => {
        if (error.name === 'AbortError') {
          console.log('Request aborted', error.message);
        } else {
          console.log(error.message);
        }
      });

    return response?.data?.response;
  }

  async addTask(taskID: string, taskName: string) {
    this.taskList.push({ taskID, taskName });
  }

  async stop() {
    this.isRunning = false;
    this.cancelCallback();
    this.abortController?.abort();
  }

  async start() {
    this.printGPT4Alert();
    this.printObjective();

    this.taskList = [];
    this.taskIDCounter = 1;
    this.isRunning = true;
    await this.addTask('1', this.firstTask);

    // Execute the loop
    await this.loop();

    if (!this.isRunning) {
      this.statusCallback({ type: 'finished' });
      return;
    }

    // Finish up
    this.statusCallback({ type: 'finished' });
    this.messageCallback(setupMessage('end-of-iterations', ''));
    this.cancelCallback();
    this.isRunning = false;
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
        this.statusCallback({ type: 'preparing' });
        const task = this.taskList.shift()!;
        this.printNextTask(task);

        // Send to execution function to complete the task based on the context
        this.statusCallback({ type: 'executing' });
        const result = await this.executeTask(this.objective, task.taskName);
        const taskID = parseInt(task.taskID, 10);
        this.printTaskResult(result);

        // Step 2: Enrich the result and store in Pinecone
        // TODO: taskEnrichment
        this.statusCallback({ type: 'saving' });
        await this.enrich(task, result, this.tableName);

        if (!this.isRunning) break;

        // Step 3: Create new tasks and reprioritize the task list
        this.statusCallback({ type: 'creating' });
        const newTasks = await this.taskCreation(
          this.objective,
          result,
          task.taskName,
        );

        if (!this.isRunning) break;

        await Promise.all(
          newTasks.map(async (task: Task) => {
            this.taskIDCounter += 1;
            task.taskID = this.taskIDCounter.toFixed();
            await this.addTask(task.taskID, task.taskName);
          }),
        );

        if (!this.isRunning) break;

        this.statusCallback({ type: 'prioritizing' });
        this.taskList = await this.taskPrioritization(this.objective, taskID);

        iteration++;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Sleep before checking the task list again
    }
  }
}
