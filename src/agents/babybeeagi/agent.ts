import { Message, MessageStatus, ToolType, UserSettings } from '@/types';
// import { webScrape } from './tools/webScrape';
import { webSearch } from './tools/webSearch';
import { textCompletion } from './tools/textCompletion';
import { overviewAgent, summarizerAgent, taskManagementAgent } from './service';
import { setupMessage } from '@/utils/message';
import { SETTINGS_KEY } from '@/utils/constants';
import axios from 'axios';

export interface Task {
  id: number;
  task: string;
  tool: ToolType;
  dependentTaskId?: number;
  status: string;
  result?: string;
  resultSummary?: string;
}

export class BabyBeeAGI {
  objective: string;
  modelName: string;
  firstTask: string;
  taskList: Task[] = [];
  sessionSummary: string = '';
  taskIdCounter: number = 1;
  isRunning: boolean;
  verbose: boolean;
  messageCallback: (message: Message) => void;
  statusCallback: (status: MessageStatus) => void;
  cancelCallback: () => void;
  abortController?: AbortController;

  constructor(
    objective: string,
    modelName: string,
    firstTask: string,
    messageCallback: (message: Message) => void,
    statusCallback: (status: MessageStatus) => void,
    cancel: () => void,
    verbose: boolean = false,
  ) {
    this.objective = objective;
    this.taskList = [];
    this.verbose = verbose;
    this.modelName = modelName;
    this.firstTask = firstTask;
    this.cancelCallback = cancel;
    this.messageCallback = messageCallback;
    this.statusCallback = statusCallback;
    this.isRunning = false;
  }

  // print logs
  printBabyBee() {
    console.log(
      '%c*****BABY BEE AGI*****\n\n%c%s',
      'color:orange',
      '',
      'Baby Bee AGI is running...',
    );
  }

  printObjective() {
    this.messageCallback(setupMessage('objective', this.objective));
    if (!this.verbose) return;
    console.log(
      '%c*****OBJECTIVE*****\n\n%c%s',
      'color:blue',
      '',
      this.objective,
    );
  }

  printTaskList() {
    if (!this.isRunning) return;

    let message = '';
    this.taskList.forEach((task) => {
      const dependentTask = task.dependentTaskId
        ? `<dependency: ${task.dependentTaskId}>`
        : '';
      message += `${task.id}: ${task.task} ${task.status} [${task.tool}] ${dependentTask} \n`;
    });

    this.messageCallback(setupMessage('task-list', message));

    if (!this.verbose) return;
    console.log('%c*****TASK LIST*****\n\n%c', 'color:fuchsia', '');
    console.log(message);
  }

  printSessionSummary() {
    if (!this.isRunning) return;

    this.messageCallback(setupMessage('session-summary', this.sessionSummary));

    if (!this.verbose) return;
    console.log('%c*****SESSION SUMMARY*****\n\n%c', 'color:orange', '');
    console.log(this.sessionSummary);
  }

  printNextTask(task: Task) {
    if (!this.isRunning) return;

    const nextTask = `${task.id}. ${task.task} **[${task.tool}]**`;
    this.messageCallback(setupMessage('next-task', nextTask));

    if (!this.verbose) return;
    console.log('%c*****NEXT TASK*****\n\n%s', 'color:green', '', nextTask);
  }

  printResult(result: string) {
    if (!this.isRunning) return;

    const output =
      result.length > 2000 ? result.slice(0, 2000) + '...' : result;
    this.messageCallback(setupMessage('task-result', output));

    if (!this.verbose) return;
    console.log('%c*****TASK RESULT*****\n%c%s', 'color:purple', '', output);
  }

  printDone() {
    if (!this.isRunning) return;

    this.messageCallback(setupMessage('done', ''));

    if (!this.verbose) return;
    console.log('%c*****DONE*****%c', 'color:blue', '');
  }

  printAllTaskCompleted() {
    if (!this.isRunning) return;

    this.messageCallback(setupMessage('complete', ''));
    if (!this.verbose) return;
    console.log('%c*****ALL TASK COMPLETED*****%c', 'color:blue', '');
  }

  // utility functions
  getUserApiKey() {
    const item = localStorage.getItem(SETTINGS_KEY);
    if (!item) {
      return undefined;
    }

    const settings = JSON.parse(item) as UserSettings;
    const openAIApiKey = settings?.openAIApiKey ?? undefined;

    return openAIApiKey;
  }

  // Tools functions
  async webSearchTool(query: string) {
    const response = await axios
      .post(
        '/api/tools/search',
        {
          query,
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

    return response?.data.response;
  }

  async webScrapeTool(url: string) {
    const response = await axios
      .post(
        '/api/tools/scrape',
        {
          url,
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

  // Task list functions
  async addTask(task: Task) {
    this.taskList.push(task);
  }

  async getTask(id: number) {
    return this.taskList.find((task) => task.id === id);
  }

  async getCompletedTasks() {
    return this.taskList.filter((task) => task.status === 'completed');
  }

  async summarizeTask(value: string) {
    const text = value.length > 2000 ? value.slice(0, 2000) + '...' : value;
    return await summarizerAgent(text, this.getUserApiKey());
  }

  async overviewTask(lastTaskId: number) {
    const tasks = await this.getCompletedTasks();
    let completeTasksText = '\n';
    tasks.forEach((task) => {
      completeTasksText += `${task.id}. ${task.task} [${task.tool}]\n`;
    });

    return await overviewAgent(
      this.objective,
      this.sessionSummary,
      lastTaskId,
      completeTasksText,
      this.getUserApiKey(),
    );
  }

  async managementTask(
    result: string,
    taskDescription: string,
    incompleteTasks: string[],
    currntTaskId: number,
  ) {
    let taskList = this.taskList;
    // copy task list
    const originalTaskList = taskList.slice();
    // minified task list
    const minifiedTaskList = taskList.map((task) => {
      const { result, ...rest } = task;
      return rest;
    });
    const websearchVar = '[web-search] ';
    const res = result.slice(0, 4000); // come up with a better solution lator

    const managedResult = await taskManagementAgent(
      minifiedTaskList,
      this.objective,
      res,
      websearchVar,
      this.modelName,
      this.getUserApiKey(),
    );

    console.log('agentResult', managedResult);

    // update task list
    this.printDone();

    try {
      taskList = JSON.parse(managedResult);
    } catch (error) {
      console.error(error);

      // TODO: handle error
      return taskList;
    }

    // Add the 'result' field back in
    for (let i = 0; i < taskList.length; i++) {
      const updatedTask = taskList[i];
      const originalTask = originalTaskList[i];

      if (originalTask?.result) {
        updatedTask.result = originalTask.result;
      }
    }
    taskList[currntTaskId]['result'] = managedResult;

    return taskList;
  }

  // Agent functions
  async executeTask(task: Task, taskList: Task[], objective: string) {
    // Check if task is already completed
    if (task.dependentTaskId) {
      const dependentTask = await this.getTask(task.dependentTaskId);
      if (dependentTask && dependentTask.status !== 'completed') {
        return;
      }
    }
    // Execute task
    this.printNextTask(task);
    let taskPrompt = `Complete your assign task based on the objective:\n\n${objective}, Your task: ${task.task}`;
    if (task.dependentTaskId) {
      const dependentTask = await this.getTask(task.dependentTaskId);
      if (dependentTask) {
        taskPrompt += `\n\nPrevious task result: ${dependentTask.result}`;
      }
    }

    taskPrompt += '\nResponse:';
    let result = '';

    switch (task.tool) {
      case 'text-completion':
        result = await textCompletion(taskPrompt, this.getUserApiKey());
        break;
      case 'web-search':
        const search = await this.webSearchTool(task.task);
        result = JSON.stringify(search);
        break;
      case 'web-scrape':
        result = await this.webScrapeTool(task.task);
        break;
    }

    this.printResult(result);

    // Update task status and result
    task.status = 'completed';
    task.result = result;
    task.resultSummary = await this.summarizeTask(result);

    // Update session summary
    this.sessionSummary = await this.overviewTask(task.id);

    // Increment task id counter
    this.taskIdCounter += 1;

    const incompleteTasks = taskList
      .filter((task) => task['status'] === 'incomplete')
      .map((task) => task['task']);

    // Update task manager agent of tasks
    this.taskList = await this.managementTask(
      result,
      task.task,
      incompleteTasks,
      task.id,
    );
  }

  async stop() {
    this.isRunning = false;
    this.cancelCallback();
    this.abortController?.abort();
  }

  async start() {
    // Add the first task
    const task: Task = {
      id: this.taskIdCounter, // 1
      task: this.firstTask,
      tool: 'text-completion',
      status: 'incomplete',
    };

    this.addTask(task);
    this.taskIdCounter = 0;
    this.printBabyBee();
    this.printObjective();

    // Start the loop
    this.isRunning = true;
    await this.loop();

    if (!this.isRunning) {
      this.statusCallback('finished');
      return;
    }

    // Objective completed
    this.printAllTaskCompleted();
    this.statusCallback('finished');
    this.messageCallback(setupMessage('complete', ''));
    this.cancelCallback();
    this.isRunning = false;
  }

  async loop() {
    // Continue the loop while there are incomplete tasks
    while (
      this.taskList.some((task) => task.status === 'incomplete') &&
      this.isRunning
    ) {
      this.statusCallback('preparing');
      // Filter out incomplete tasks
      const incompleteTasks = this.taskList.filter(
        (task) => task.status === 'incomplete',
      );

      if (incompleteTasks.length === 0) {
        break;
      }

      // sort tasks by id
      incompleteTasks.sort((a, b) => a.id - b.id);

      // Pull the first task
      const task = incompleteTasks[0];

      if (!this.isRunning) break;

      this.statusCallback('executing');
      // Execute the task & call task manager from function
      await this.executeTask(task, incompleteTasks, this.objective);

      // Print task list and session summary
      this.printTaskList();
      this.printSessionSummary();
    }
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Sleep before checking the task list again
  }
}
