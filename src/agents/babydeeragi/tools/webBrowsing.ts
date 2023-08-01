import { simplifySearchResults } from '@/agents/common/tools/webSearch';
import { AgentStatus, AgentTask, Message } from '@/types';
import axios from 'axios';
import { getTaskById } from '@/utils/task';
import { analystPrompt, searchQueryPrompt } from '../prompt';
import { textCompletionTool } from '../../common/tools/textCompletionTool';
import { largeTextExtract } from './largeTextExtract';
import { translate } from '@/utils/translate';

export const webBrowsing = async (
  objective: string,
  task: AgentTask,
  dependentTasksOutput: string,
  messageCallback: (message: Message) => void,
  statusCallback?: (status: AgentStatus) => void,
  isRunningRef?: React.MutableRefObject<boolean>,
  verbose: boolean = false,
  modelName: string = 'gpt-3.5-turbo',
  language: string = 'en',
  signal?: AbortSignal,
) => {
  const prompt = searchQueryPrompt(
    task.task,
    dependentTasksOutput.slice(0, 3500),
  );
  const searchQuery = await textCompletionTool(prompt, modelName, signal);

  const trimmedQuery = searchQuery.replace(/^"|"$/g, ''); // remove quotes from the search query

  let title = `🔎 Searching: ${trimmedQuery}`;
  let message = `Search query: ${trimmedQuery}\n`;
  callbackSearchStatus(title, message, task, messageCallback);
  const searchResults = await webSearchTool(trimmedQuery, signal);
  if (!searchResults) {
    return 'Failed to search.';
  }
  let statusMessage = message;

  if (!isRunningRef?.current) return;

  const simplifiedSearchResults = simplifySearchResults(searchResults);
  title = `📖 Reading content...`;
  message = `✅ Completed search. \nNow reading content.\n`;
  if (verbose) {
    console.log(message);
  }

  statusMessage += message;
  callbackSearchStatus(title, statusMessage, task, messageCallback);

  if (!isRunningRef.current) return;

  let results = '';
  let index = 1;
  let completedCount = 0;
  const MaxCompletedCount = 3;
  // Loop through search results
  for (const searchResult of simplifiedSearchResults) {
    if (!isRunningRef.current) return;
    if (completedCount >= MaxCompletedCount) break;

    // Extract the URL from the search result
    const url = searchResult.link;
    let title = `${index}. Reading: ${url} ...`;

    if (verbose) {
      console.log(message);
    }
    statusMessage += `${title}\n`;
    callbackSearchStatus(title, statusMessage, task, messageCallback);

    const content = (await webScrapeTool(url, signal)) ?? '';

    title = `${index}. Extracting relevant info...`;
    message = `  - Content reading completed. Length:${content.length}. Now extracting relevant info...\n`;
    if (verbose) {
      console.log(message);
    }

    statusMessage += message;
    callbackSearchStatus(title, statusMessage, task, messageCallback);

    if (content.length === 0) {
      let message = `  - Content too short. Skipped. \n`;
      if (verbose) console.log(message);
      statusMessage += message;
      callbackSearchStatus(undefined, statusMessage, task, messageCallback);
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
      title = `${index}. Extracting relevant info... ${message}`;
      callbackSearchStatus(title, statusMessage, task, messageCallback);
    };

    statusMessage += `  - Extracting relevant information\n`;
    title = `${index}. Extracting relevant info...`;
    callbackSearchStatus(title, statusMessage, task, messageCallback);
    const info = await largeTextExtract(
      objective,
      content.slice(0, 20000),
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
    title = `${index}. Relevant info...`;
    callbackSearchStatus(title, statusMessage, task, messageCallback);

    results += `${info}. `;
    index += 1;
    completedCount += 1;
  }

  if (!isRunningRef.current) return;

  callbackSearchStatus(
    'Analyzing results...',
    `${statusMessage}Analyze results...`,
    task,
    messageCallback,
  );

  const ap = analystPrompt(results, language);
  const analyzedResults = await textCompletionTool(
    ap,
    modelName,
    signal,
    task.id,
    messageCallback,
  );

  // callback to search logs
  const msg: Message = {
    type: 'search-logs',
    text: '```markdown\n' + statusMessage + '\n```',
    title: `🔎 ${translate('SEARCH_LOGS', 'message')}`,
    id: task.id,
    icon: '🌐',
    open: false,
  };
  messageCallback(msg);

  return analyzedResults;
};

const callbackSearchStatus = (
  title: string | undefined,
  message: string,
  task: AgentTask,
  messageCallback: (message: Message) => void,
) => {
  messageCallback({
    type: 'search-logs',
    title: title ?? translate('SEARCH_LOGS', 'message'),
    text: '```markdown\n' + message + '\n```',
    id: task.id,
    icon: '🌐',
    open: false,
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
