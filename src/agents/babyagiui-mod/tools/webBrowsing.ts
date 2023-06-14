import { simplifySearchResults } from '@/agents/common/tools/webSearch';
import { AgentStatus, AgentTask, Message } from '@/types';
import { setupMessage } from '@/utils/message';
import axios from 'axios';
import { largeTextExtract } from './largeTextExtract';
import { searchQueryGenerationAgent } from '../agents/searchQueryGeneration/searchQueryGenerationAgent';

export const webBrowsing = async (
  objective: string,
  task: AgentTask,
  messageCallback: (message: Message) => void,
  statusCallback: (status: AgentStatus) => void,
  isRunningRef: React.MutableRefObject<boolean>,
  verbose: boolean,
  signal?: AbortSignal,
) => {
  const searchQuery = await searchQueryGenerationAgent(
    task,
    'gpt-3.5-turbo-0613',
    signal,
  );

  const trimmedQuery = searchQuery.replace(/^"|"$/g, '');
  const searchResults = await webSearchTool(trimmedQuery, signal);

  if (!isRunningRef.current) return;

  const sinmplifiedSearchResults = simplifySearchResults(searchResults);
  if (verbose) {
    console.log(
      `Completed search (query: ${trimmedQuery}). \nNow scraping results.\n`,
    );
  }
  let statusMessage = `Completed search (query: ${trimmedQuery}). \nNow scraping results.\n`;
  callbackSearchStatus(statusMessage, statusCallback);

  if (!isRunningRef.current) return;

  let result = '';
  let index = 1;
  // Loop through search results
  for (const searchResult of sinmplifiedSearchResults) {
    if (!isRunningRef.current) return;

    // Extract the URL from the search result
    const url = searchResult.link;
    if (verbose) {
      console.log('Scraping: %s ...', url);
    }
    statusMessage += `${index}. Scraping: ${url} ...\n`;
    callbackSearchStatus(statusMessage, statusCallback);

    const searchContent = `${searchResult.title}. ${searchResult.snippet} ${url}. \n`;
    const content = (await webScrapeTool(url, signal)) ?? '';

    if (verbose) {
      console.log(
        'Scrape completed. Length:%s. Now extracting relevant info... \n',
        content.length,
      );
    }

    statusMessage += `  - Scrape completed. Length:${content.length}. Now extracting relevant info... \n`;
    callbackSearchStatus(statusMessage, statusCallback);

    if (!isRunningRef.current) return;

    // extract relevant text from the scraped text
    const info = await largeTextExtract(
      objective,
      `${searchContent} \n ${content}`,
      task,
      isRunningRef,
      signal,
    );
    // combine search result and scraped text
    result += `${info}. `;

    if (verbose) {
      console.log('Content: %s ...\n', result.slice(0, 100));
    }
    statusMessage += `  - Content: ${result.slice(0, 100)} ...\n`;
    callbackSearchStatus(statusMessage, statusCallback);

    index++;
  }

  if (!isRunningRef.current) return;

  // callback to search logs
  messageCallback(
    setupMessage('search-logs', '```markdown\n' + statusMessage + '\n```'),
  );
  return result;
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
