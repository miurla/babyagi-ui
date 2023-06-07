import { simplifySearchResults } from '@/agents/common/tools/webSearch';
import { AgentStatus, AgentTask, Message } from '@/types';
import { setupMessage } from '@/utils/message';
import axios from 'axios';
import { getTaskById } from '@/utils/task';
import { analystPrompt, searchQueryPrompt } from '../prompt';
import { textCompletionTool } from '../../common/tools/textCompletionTool';
import { largeTextExtract } from './largeTextExtract';

export const webBrowsing = async (
  objective: string,
  task: AgentTask,
  taskList: AgentTask[],
  messageCallback: (message: Message) => void,
  statusCallback: (status: AgentStatus) => void,
  isRunningRef: React.MutableRefObject<boolean>,
  verbose: boolean,
  modelName: string,
  language: string,
  signal?: AbortSignal,
) => {
  let dependentTasksOutput = '';
  if (task.dependentTaskIds) {
    for (const dependentTaskId of task.dependentTaskIds) {
      const dependentTask = getTaskById(taskList, dependentTaskId);
      if (!dependentTask) continue;
      const dependentTaskOutput = dependentTask.output?.slice(0, 2000);
      dependentTasksOutput += ` ${dependentTaskOutput}`;
    }
  }

  const prompt = searchQueryPrompt(task.task, dependentTasksOutput);
  const searchQuery = await textCompletionTool(prompt, modelName, signal);

  const trimmedQuery = searchQuery.replace(/^"|"$/g, ''); // remove quotes from the search query
  const searchResults = await webSearchTool(trimmedQuery, signal);
  console.log('Search results: ', searchResults.length);

  if (!isRunningRef.current) return;

  const sinmplifiedSearchResults = simplifySearchResults(searchResults);
  const message = `Search query: ${trimmedQuery}\nCompleted search. \nNow scraping results.\n`;
  if (verbose) {
    console.log(message);
  }

  let statusMessage = message;
  callbackSearchStatus(statusMessage, statusCallback);

  if (!isRunningRef.current) return;

  let results = '';
  let index = 1;
  // Loop through search results
  for (const searchResult of sinmplifiedSearchResults) {
    if (!isRunningRef.current) return;

    // Extract the URL from the search result
    const url = searchResult.link;
    let message = `${index}. Scraping: ${url} ...\n`;

    if (verbose) {
      console.log(message);
    }
    statusMessage += message;
    callbackSearchStatus(statusMessage, statusCallback);

    const content = (await webScrapeTool(url, signal)) ?? '';

    message = `  - Scrape completed. Length:${content.length}. Now extracting relevant info...\n`;
    if (verbose) {
      console.log(message);
    }

    statusMessage += message;
    callbackSearchStatus(statusMessage, statusCallback);

    if (content.length === 0) {
      let message = `  - Content too short. Skipped. \n`;
      if (verbose) console.log(message);
      statusMessage += message;
      callbackSearchStatus(statusMessage, statusCallback);
      index += 1;
      continue;
    }

    if (!isRunningRef.current) return;

    // extract relevant text from the scraped text
    const callback = (message: string) => {
      if (verbose) {
        console.log(message);
      }
      statusMessage = `${statusMessage}${message}`;
      callbackSearchStatus(statusMessage, statusCallback);
    };

    statusMessage += `  - Extracting relevant information\n`;
    callbackSearchStatus(statusMessage, statusCallback);
    const info = await largeTextExtract(
      objective,
      content,
      task,
      isRunningRef,
      callback,
      signal,
    );

    message = `  - Relevant info: ${info
      .slice(0, 100)
      .replace(/\r?\n/g, '')} ...\n`;
    if (verbose) {
      console.log(message);
    }
    statusMessage += message;
    callbackSearchStatus(statusMessage, statusCallback);

    results += `${info}. `;
    index += 1;
  }

  if (!isRunningRef.current) return;

  callbackSearchStatus(`${statusMessage}Analyze results...`, statusCallback);
  const ap = analystPrompt(results, language);
  const analyzedResults = await textCompletionTool(ap, modelName, signal);

  // callback to search logs
  messageCallback(
    setupMessage('search-logs', '```markdown\n' + statusMessage + '\n```'),
  );
  return analyzedResults;
};

const callbackSearchStatus = (
  message: string,
  statusCallback: (status: AgentStatus) => void,
) => {
  statusCallback({
    type: 'executing-stream',
    message: '```markdown\n' + message + '\n```',
  });
};

const webSearchTool = async (query: string, signal?: AbortSignal) => {
  const response = await axios
    .post(
      '/api/tools/search',
      {
        query,
      },
      {
        signal: signal,
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
};

const webScrapeTool = async (url: string, signal?: AbortSignal) => {
  const response = await axios
    .post(
      '/api/tools/scrape',
      {
        url,
      },
      {
        signal: signal,
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
};
