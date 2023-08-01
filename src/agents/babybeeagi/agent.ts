import { AgentStatus, Message, TaskStatus, ToolType } from '@/types';
import { textCompletion } from './tools/textCompletion';
import { overviewAgent, summarizerAgent, taskManagementAgent } from './service';
import { getToolIcon, setupMessage } from '@/utils/message';
import axios from 'axios';
import { parseTasks } from '@/utils/task';
import { getUserApiKey } from '@/utils/settings';
import { t } from 'i18next';
import { translate } from '@/utils/translate';

export interface AgentTask {
  id: number;
  task: string;
  tool: ToolType;
  dependentTaskId?: number;
  status: TaskStatus;
  result?: string;
  resultSummary?: string;
}

export class BabyBeeAGI {
  objective: string;
  modelName: string;
  firstTask: string;
  taskList: AgentTask[] = [];
  sessionSummary: string = '';
  taskIdCounter: number = 1;
  isRunning: boolean;
  verbose: boolean;
  language: string = 'en';
  messageCallback: (message: Message) => void;
  statusCallback: (status: AgentStatus) => void;
  cancelCallback: () => void;
  abortController?: AbortController;

  constructor(
    objective: string,
    modelName: string,
    firstTask: string,
    messageCallback: (message: Message) => void,
    statusCallback: (status: AgentStatus) => void,
    cancel: () => void,
    language: string = 'en',
    verbose: boolean = false,
  ) {
    this.objective = objective;
    this.taskList = [];
    this.verbose = verbose;
    this.language = language;
    this.modelName = modelName;
    this.firstTask = firstTask;
    this.cancelCallback = cancel;
    this.messageCallback = messageCallback;
    this.statusCallback = statusCallback;
    this.isRunning = false;
  }

  // print logs
  printBabyBee() {
    if (!this.verbose) return;
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

    let message =
      '| ID | Status | Task  | Tool | Dependency | \n | :-: | :-: | - | :-: | :-: | \n';
    this.taskList.forEach((task) => {
      const dependentTask = task.dependentTaskId
        ? `${task.dependentTaskId}`
        : '-';
      const status = task.status === 'complete' ? '✅' : '⬜️';
      message += `| ${task.id} | ${status} | ${task.task} | ${getToolIcon(
        task.tool,
      )} | ${dependentTask} |\n`;
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

  printNextTask(task: AgentTask) {
    if (!this.isRunning) return;

    const nextTask = `${task.id}. ${task.task} - **[${getToolIcon(task.tool)} ${
      task.tool
    }]**`;
    this.messageCallback(setupMessage('next-task', nextTask));

    if (!this.verbose) return;
    console.log('%c*****NEXT TASK*****\n\n%s', 'color:green', '', nextTask);
  }

  printResult(result: string, task: AgentTask) {
    if (!this.isRunning) return;

    let output = result;
    if (task.tool !== 'text-completion') {
      // code block for non-text-completion tools
      output = '```\n' + output + '\n```';
    }
    this.messageCallback(setupMessage('task-result', output, task?.tool));

    if (!this.verbose) return;
    output = result.length > 2000 ? result.slice(0, 2000) + '...' : result;
    console.log('%c*****TASK RESULT*****\n%c%s', 'color:purple', '', output);
  }

  printResultSummary(summary: string) {
    if (!this.isRunning) return;

    this.messageCallback(setupMessage('task-result-summary', summary));

    if (!this.verbose) return;
    console.log(
      '%c*****TASK RESULT SUMMARY*****\n%c%s',
      'color:purple',
      '',
      summary,
    );
  }

  printDone() {
    if (!this.isRunning) return;

    this.messageCallback(
      setupMessage(
        'done',
        `Number of tasks completed: ${this.taskIdCounter.toString()}`,
      ),
    );

    if (!this.verbose) return;
    console.log('%c*****DONE*****%c', 'color:blue', '');
  }

  printAllTaskCompleted() {
    if (!this.isRunning) return;

    this.messageCallback(
      setupMessage('complete', translate('ALL_TASK_COMPLETED_TOAST', 'agent')),
    );
    if (!this.verbose) return;
    console.log('%c*****ALL TASK COMPLETED*****%c', 'color:blue', '');
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

  async textCompletionTool(prompt: string) {
    if (getUserApiKey()) {
      return await textCompletion(
        prompt,
        'gpt-3.5-turbo-0613',
        getUserApiKey(),
      );
    }

    const response = await axios
      .post(
        '/api/tools/completion',
        {
          prompt,
          apiKey: getUserApiKey(),
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
  async addTask(task: AgentTask) {
    this.taskList.push(task);
  }

  async getTask(id: number) {
    return this.taskList.find((task) => task.id === id);
  }

  async getCompletedTasks() {
    return this.taskList.filter((task) => task.status === 'complete');
  }

  async summarizeTask(value: string) {
    const text = value.length > 4000 ? value.slice(0, 4000) + '...' : value;

    if (getUserApiKey()) {
      return await summarizerAgent(text, this.language, getUserApiKey());
    }

    const response = await axios
      .post(
        '/api/agents/summarize',
        {
          text,
          language: this.language,
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

  async overviewTask(lastTaskId: number) {
    const completedTasks = await this.getCompletedTasks();
    let completedTasksText = '';
    completedTasks.forEach((task) => {
      completedTasksText += `${task.id}. ${task.task} - ${task.resultSummary}\n`;
    });

    if (getUserApiKey()) {
      return await overviewAgent(
        this.objective,
        this.sessionSummary,
        lastTaskId,
        completedTasksText,
        getUserApiKey(),
      );
    }

    const response = await axios
      .post(
        '/api/agents/overview',
        {
          objective: this.objective,
          session_summary: this.sessionSummary,
          last_task_id: lastTaskId,
          completed_tasks_text: completedTasksText,
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
    const websearchVar = process.env.SERP_API_KEY ? '[web-search] ' : ''; // if search api key is not set, don't add [web-search] to the task description
    const res = result.slice(0, 4000); // come up with a better solution lator

    let managedResult = '';
    if (getUserApiKey()) {
      managedResult = await taskManagementAgent(
        minifiedTaskList,
        this.objective,
        res,
        websearchVar,
        this.modelName,
        this.language,
        getUserApiKey(),
      );
    } else {
      const response = await axios
        .post(
          '/api/agents/management',
          {
            task_list: minifiedTaskList,
            objective: this.objective,
            result: res,
            websearch_var: websearchVar,
            model_name: this.modelName,
            language: this.language,
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

      managedResult = response?.data?.response;
    }

    // update task list
    try {
      taskList = parseTasks(managedResult);
    } catch (error) {
      console.error(error);

      // TODO: handle error
      return taskList;
    }

    // Add the 'result' field back in
    for (let i = 0; i < taskList.length; i++) {
      const originalTask = originalTaskList[i];
      if (originalTask?.result) {
        taskList[i].result = originalTask.result;
      }
    }

    const currentTask = taskList[currntTaskId - 1];
    if (currentTask) {
      taskList[currntTaskId - 1].result = managedResult;
    }

    return taskList;
  }

  // Agent functions
  async executeTask(task: AgentTask, taskList: AgentTask[], objective: string) {
    // Check if task is already completed
    let dependentTask;
    if (task.dependentTaskId) {
      dependentTask = await this.getTask(task.dependentTaskId);
      if (!dependentTask || dependentTask.status !== 'complete') {
        return;
      }
    }

    // Execute task
    this.statusCallback({ type: 'executing' });
    this.printNextTask(task);
    let taskPrompt = `Complete your assign task based on the objective:\n\n${objective}, Your task: ${task.task}`;
    if (task.dependentTaskId) {
      if (dependentTask) {
        const dependentTaskResult = dependentTask.resultSummary; // Use summary instead of result to avoid long text (original code use result)
        // console.log('dependentTaskResult: ', dependentTaskResult);
        taskPrompt += `\nThe previous task ${dependentTask.id}. ${dependentTask.task} result: ${dependentTaskResult}`;
      }
    }

    // taskPrompt += '\nResponses should be no more than 1000 characters.'; // Added message (Not in original code)
    taskPrompt += '\nResponse:';
    let result = '';

    switch (task.tool) {
      case 'text-completion':
        result =
          (await this.textCompletionTool(taskPrompt)) ??
          'Failed to complete text';
        break;
      case 'web-search':
        const search = (await this.webSearchTool(task.task)) ?? '';
        result = JSON.stringify(search);
        break;
      case 'web-scrape':
        result =
          (await this.webScrapeTool(task.task)) ?? 'Failed to scrape web page';
        break;
      default:
        result = 'Unknown tool';
        break;
    }

    this.printResult(result, task);

    this.statusCallback({ type: 'updating' });
    // Update task status and result
    task.status = 'complete';
    task.result = result;
    task.resultSummary = await this.summarizeTask(result);

    this.printResultSummary(task.resultSummary ?? '');

    this.statusCallback({ type: 'summarizing' });
    // Update session summary
    this.sessionSummary = await this.overviewTask(task.id);

    this.printSessionSummary();

    // Increment task id counter
    this.taskIdCounter += 1;

    const incompleteTasks = taskList
      .filter((task) => task.status === 'incomplete')
      .map((task) => task.task);

    this.statusCallback({ type: 'managing' });
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
    const task: AgentTask = {
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
      this.statusCallback({ type: 'finished' });
      return;
    }

    // Objective completed
    this.printAllTaskCompleted();
    this.statusCallback({ type: 'finished' });
    this.cancelCallback();
    this.isRunning = false;
  }

  async loop() {
    // Continue the loop while there are incomplete tasks
    while (
      this.taskList.some((task) => task.status === 'incomplete') &&
      this.isRunning
    ) {
      this.statusCallback({ type: 'preparing' });
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

      // Execute the task & call task manager from function
      await this.executeTask(task, incompleteTasks, this.objective);

      this.statusCallback({ type: 'closing' });
      // Print task list
      this.printTaskList();
      this.printDone();

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Sleep before checking the task list again
    }
  }
}
