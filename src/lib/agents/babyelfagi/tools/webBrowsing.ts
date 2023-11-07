import { simplifySearchResults } from '@/lib/agents/babyelfagi/tools/webSearch';
import { AgentTask, AgentMessage } from '@/types';
import { analystPrompt, searchQueryPrompt } from '../../../../utils/prompt';
import { textCompletion, generateText } from './utils/textCompletion';
import { largeTextExtract } from './utils/largeTextExtract';
import { v4 as uuidv4 } from 'uuid';
import { webSearch } from './webSearch';
import { webScrape } from './webScrape';

export const webBrowsing = async (
  objective: string,
  task: AgentTask,
  dependentTasksOutput: string,
  messageCallback: (message: AgentMessage) => void,
  verbose: boolean = false,
  modelName: string = 'gpt-3.5-turbo',
  language: string = 'en',
  userApiKey?: string,
  signal?: AbortSignal,
) => {
  let id = uuidv4();
  const prompt = searchQueryPrompt(
    task.task,
    dependentTasksOutput.slice(0, 3500),
  );
  const searchQuery = await textCompletion(
    prompt,
    id,
    task,
    modelName,
    userApiKey,
    signal,
  );
  const trimmedQuery = searchQuery?.replace(/^"|"$/g, ''); // remove quotes from the search query

  let message = `Search query: ${trimmedQuery}\n`;
  callbackSearchStatus(id, message, task, messageCallback, verbose);
  const searchResults = await webSearch(trimmedQuery || '');
  if (!searchResults) {
    return 'Failed to search.';
  }

  const simplifiedSearchResults = simplifySearchResults(searchResults);
  message = `✅ Completed search. \nNow reading content.\n`;
  callbackSearchStatus(id, message, task, messageCallback, verbose);

  let results = '';
  let index = 1;
  let completedCount = 0;
  const MaxRetryCount = 3;
  let sufficientResultsObtained = false;

  // Loop through search results
  for (const searchResult of simplifiedSearchResults) {
    if (signal?.aborted) return '';
    if (completedCount >= MaxRetryCount || sufficientResultsObtained) break;

    // Extract the URL from the search result
    const url = searchResult.link;
    let title = `${index}. Reading: ${url} ...`;

    message = `${title}\n`;
    callbackSearchStatus(id, message, task, messageCallback, verbose);

    const content = await webScrape(url);
    if (!content) {
      let message = `  - Failed to read content. Skipped. \n`;
      callbackSearchStatus(id, message, task, messageCallback, verbose);
      continue;
    }

    title = `${index}. Extracting relevant info...`;
    message = `  - Content reading completed. Length:${content?.length}. Now extracting relevant info...\n`;
    callbackSearchStatus(id, message, task, messageCallback, verbose);

    if (content?.length === 0) {
      let message = `  - Content too short. Skipped. \n`;
      callbackSearchStatus(id, message, task, messageCallback, verbose);
      index += 1;
      continue;
    }

    message = `  - Extracting relevant information\n`;
    title = `${index}. Extracting relevant info...`;
    callbackSearchStatus(id, message, task, messageCallback, verbose);

    // Set an interval to ping callbackSearchStatus every 10 seconds
    const intervalId = setInterval(() => {
      message = '  - Still extracting relevant information...\n';
      callbackSearchStatus(id, message, task, messageCallback, verbose);
    }, 10000);

    const info = await largeTextExtract(
      id,
      objective,
      content,
      task,
      userApiKey,
      messageCallback,
      signal,
      modelName,
    );
    clearInterval(intervalId);

    message = `  - Relevant info: ${info
      .slice(0, 100)
      .replace(/\r?\n/g, '')} ...\n`;

    title = `${index}. Relevant info...`;
    callbackSearchStatus(id, message, task, messageCallback, verbose);

    const reflect = `You are expart task manager.
    Your Mission: You'll be provided with a goal for the team to accomplish and one task from the team's task list and its results.
    You decide if the results of the task are satisfactory.
    Your judgment will determine whether the task is complete or not.
    RULE: If you judge the task to be complete, then OK. If it needs to be redone, then just reply with NG.
    Do not include anything else in your response.
    Objective: ${objective}
    TASK: ${task.task}
    Result: ${info}
    `;

    const judgment = await generateText(
      reflect,
      { temperature: 0.0 },
      userApiKey,
      signal,
    );
    sufficientResultsObtained = judgment === 'OK';

    results += `${info}. `;
    index += 1;
    completedCount += 1;
  }

  message = 'Analyzing results...\n';
  callbackSearchStatus(id, message, task, messageCallback, verbose);

  const outputId = uuidv4();
  const ap = analystPrompt(results, language);
  const analyzedResults = await textCompletion(
    ap,
    outputId,
    task,
    modelName,
    userApiKey,
    signal,
    messageCallback,
  );

  // callback to search logs
  message = 'Completed analyzing results.';
  const msg: AgentMessage = {
    id,
    taskId: task.id.toString(),
    type: task.skill,
    content: message,
    style: 'log',
    status: 'complete',
  };
  messageCallback(msg);

  return analyzedResults;
};

const callbackSearchStatus = (
  id: string,
  message: string,
  task: AgentTask,
  messageCallback: (message: AgentMessage) => void,
  verbose: boolean = false,
) => {
  if (verbose) {
    console.log(message);
  }

  messageCallback({
    id,
    taskId: task.id.toString(),
    type: task.skill,
    style: 'log',
    content: message,
    status: 'running',
  });
};
