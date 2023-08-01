import { AgentStatus, AgentTask, Message } from '@/types';
import { textCompletion } from './tools/textCompletion';
import { getToolIcon, setupMessage } from '@/utils/message';
import axios from 'axios';
import { parseTasks } from '@/utils/task';
import { getUserApiKey } from '@/utils/settings';
import { extractRelevantInfoAgent, taskCreationAgent } from './service';
import { simplifySearchResults } from '../common/tools/webSearch';

export class BabyCatAGI {
  objective: string;
  modelName: string;
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
  chunk: string = '';

  constructor(
    objective: string,
    modelName: string,
    messageCallback: (message: Message) => void,
    statusCallback: (status: AgentStatus) => void,
    cancel: () => void,
    language: string = 'en',
    verbose: boolean = false,
  ) {
    this.objective = objective;
    this.taskList = [];
    this.verbose = verbose;
    this.modelName = modelName;
    this.language = language;
    this.cancelCallback = cancel;
    this.messageCallback = messageCallback;
    this.statusCallback = statusCallback;
    this.isRunning = false;
  }

  // print logs
  printBabyCat() {
    if (!this.verbose) return;
    console.log(
      '%c*****BABY CAT AGI*****\n\n%c%s',
      'color:orange',
      '',
      'Baby Cat AGI is running...',
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
      const dependentTask = task.dependentTaskIds
        ? `${task.dependentTaskIds.join(', ')}`
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

  printTaskOutput(output: string, task: AgentTask) {
    if (!this.isRunning) return;

    if (task.tool !== 'text-completion') {
      // code block for non-text-completion tools
      output = '```\n' + output + '\n```';
    }
    this.messageCallback(setupMessage('task-output', output, task?.tool));

    if (!this.verbose) return;
    console.log('%c*****TASK RESULT*****\n%c%s', 'color:purple', '', output);
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

    this.messageCallback(setupMessage('complete', 'All Tasks Completed'));
    if (!this.verbose) return;
    console.log('%c*****ALL TASK COMPLETED*****%c', 'color:blue', '');
  }

  // Tools functions
  async textCompletionTool(prompt: string) {
    this.abortController = new AbortController();
    this.statusCallback({ type: 'executing' });

    this.chunk = '```markdown\n';
    const callback = (token: string) => {
      this.chunk += token;
      this.statusCallback({ type: 'executing-stream', message: this.chunk });
    };

    if (getUserApiKey()) {
      this.statusCallback({ type: 'executing-stream' });

      return await textCompletion(
        prompt,
        'gpt-3.5-turbo-0613',
        this.abortController?.signal,
        getUserApiKey(),
        callback,
      );
    }

    const response = await axios
      .post(
        '/api/tools/completion',
        {
          prompt,
          apiKey: getUserApiKey(),
          callback,
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

  async callbackSearchStatus(message: string) {
    this.statusCallback({
      type: 'executing-stream',
      message: '```markdown\n' + message + '\n```',
    });
  }

  async webSearchToolWithAgent(task: AgentTask) {
    // get search results
    const searchResults = await this.webSearchTool(task.task);

    if (!this.isRunning) return;

    // simplify search results
    const sinmplifiedSearchResults = simplifySearchResults(searchResults);
    if (this.verbose) {
      console.log('Completed search. Now scraping results.\n');
    }
    let statusMessage = 'Completed search. Now scraping results.\n';
    this.callbackSearchStatus(statusMessage);

    if (!this.isRunning) return;

    let result = '';
    let index = 1;
    // Loop through search results
    for (const searchResult of sinmplifiedSearchResults) {
      if (!this.isRunning) break;
      if (index >= 5) break;

      // Extract the URL from the search result
      const url = searchResult.link;
      if (this.verbose) {
        console.log('Scraping: %s ...', url);
      }
      statusMessage += `${index}. Scraping: ${url} ...\n`;
      this.callbackSearchStatus(statusMessage);

      const content = await this.webScrapeTool(url);
      if (!content) continue;

      if (this.verbose) {
        console.log(
          'Scrape completed. Length:%s. Now extracting relevant info... \n',
          content.length,
        );
      }
      statusMessage += `  - Scrape completed. Length:${content.length}. Now extracting relevant info... \n`;
      this.callbackSearchStatus(statusMessage);

      if (!this.isRunning) break;

      // extract relevant text from the scraped text
      const info = await this.extractRelevantInfo(content.slice(0, 5000), task);
      // combine search result and scraped text
      result += `${info}. `;

      if (this.verbose) {
        console.log('Content: %s ...\n', result.slice(0, 100));
      }
      statusMessage += `  - Content: ${result.slice(0, 100)} ...\n`;
      this.callbackSearchStatus(statusMessage);

      index++;
    }

    if (!this.isRunning) return;

    // callback to search logs
    this.messageCallback(
      setupMessage('search-logs', '```markdown\n' + statusMessage + '\n```'),
    );

    return result;
  }

  async extractRelevantInfo(largeString: string, task: AgentTask) {
    const chunkSize = 2800; //3000;
    const overlap = 500;
    let notes = '';

    for (let i = 0; i < largeString.length; i += chunkSize - overlap) {
      if (!this.isRunning) break;

      const chunk = largeString.slice(i, i + chunkSize);
      if (getUserApiKey()) {
        const response = await extractRelevantInfoAgent(
          this.objective,
          task.task,
          chunk,
          notes,
          getUserApiKey(),
        );
        notes += response;
      } else {
        // Server side call
        const response = await axios
          .post(
            '/api/tools/extract',
            {
              objective: this.objective,
              task: task.task,
              chunk,
              notes,
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
        notes += response?.data?.response;
      }
    }
    return notes;
  }

  // Task list functions
  async addTask(task: AgentTask) {
    this.taskList.push(task);
  }

  async getTaskById(id: number) {
    return this.taskList.find((task) => task.id === id);
  }

  async getCompletedTasks() {
    return this.taskList.filter((task) => task.status === 'complete');
  }

  // Agent functions
  async taskCreationAgent() {
    this.abortController = new AbortController();
    const websearchVar = process.env.SERP_API_KEY ? '[web-search] ' : ''; // if search api key is not set, don't add [web-search] to the task description

    this.chunk = '```json\n';
    const callback = (token: string) => {
      this.chunk += token;
      this.statusCallback({ type: 'creating-stream', message: this.chunk });
    };

    let result = '';
    if (getUserApiKey()) {
      this.statusCallback({ type: 'creating-stream' });

      result = await taskCreationAgent(
        this.objective,
        websearchVar,
        this.modelName,
        this.language,
        this.abortController?.signal,
        getUserApiKey(),
        callback,
      );
    } else {
      // Server side call
      const response = await axios
        .post(
          '/api/agents/create',
          {
            objective: this.objective,
            websearch_var: websearchVar,
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
      result = response?.data?.response;
    }

    if (!result) {
      return [];
    }

    let taskList = this.taskList;
    // update task list
    try {
      taskList = parseTasks(result);
    } catch (error) {
      console.error(error);
      // TODO: handle error
    }

    return taskList;
  }

  async executeTask(task: AgentTask, taskList: AgentTask[], objective: string) {
    // Check if dependent task id is not empty
    if (task.dependentTaskIds) {
      let allDependentTasksCompleted = true;
      for (const id of task.dependentTaskIds) {
        const dependentTask = await this.getTaskById(id);
        if (dependentTask?.status !== 'complete') {
          allDependentTasksCompleted = false;
          break;
        }
      }
    }

    if (!this.isRunning) return;

    // Execute the task
    this.statusCallback({ type: 'executing' });
    this.printNextTask(task);

    let taskPrompt = `Complete your assigned task based on the objective and only based on information provided in the dependent task output, if provided. Your objective: ${objective}. Your task: ${task.task}`;
    if (task.dependentTaskIds) {
      let dependentTasksOutput = '';
      for (const id of task.dependentTaskIds) {
        const dependentTasks = await this.getTaskById(id);
        const dependentTaskOutput = dependentTasks?.output?.slice(0, 2000);
        dependentTasksOutput += dependentTaskOutput;
      }
      taskPrompt += `Your dependent task output: ${dependentTasksOutput}\n OUTPUT:`;
    }

    if (!this.isRunning) return;

    // Use the tool to complete the task
    let taskOutput = '';
    switch (task.tool) {
      case 'text-completion':
        taskOutput = await this.textCompletionTool(taskPrompt);
        break;
      case 'web-search':
        taskOutput = (await this.webSearchToolWithAgent(task)) ?? '';
        break;
      default:
        break;
    }

    // Find the task index in the task list
    const taskIndex = taskList.findIndex((t) => t.id === task.id);

    // Matk task as complete and update the output
    taskList[taskIndex].status = 'complete';
    taskList[taskIndex].output = taskOutput;

    // print the task output
    this.printTaskOutput(taskOutput, task);

    this.sessionSummary += `\n\nTask: ${task.id} - ${task.task}\n${taskOutput}`;
  }

  async stop() {
    this.isRunning = false;
    this.cancelCallback();
    this.abortController?.abort();
  }

  async start() {
    this.isRunning = true;
    this.printBabyCat();
    this.printObjective();

    // Initialize the task id counter
    this.taskIdCounter = 0;

    // Run the task creation agent to create the initial tasks
    this.taskList = (await this.taskCreationAgent()) ?? [];

    this.printTaskList();

    if (!this.isRunning) return;

    // Start the loop
    await this.loop();

    if (!this.isRunning) {
      this.statusCallback({ type: 'finished' });
      return;
    }

    // Objective completed
    this.printSessionSummary();
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

      // Pull the first task
      const task = incompleteTasks[0];

      if (!this.isRunning) break;

      await this.executeTask(task, this.taskList, this.objective);

      this.taskIdCounter += 1;
      this.statusCallback({ type: 'closing' });
      // Print task list
      this.printTaskList();
      this.printDone();
    }
  }
}
