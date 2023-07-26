import { AgentTask } from '@/types';
import { Skill } from '../skill';
import axios from 'axios';
import { largeTextExtract } from '@/agents/babydeeragi/tools/largeTextExtract';
import { translate } from '@/utils/translate';

export class WebReader extends Skill {
  name = 'web_reader';
  descriptionForHuman = 'This skill reads web pages from provided URLs.';
  descriptionForModel =
    'This skill reads web pages from provided URLs. Returns the web page content.';
  icon = '🌐';

  async execute(
    task: AgentTask,
    dependentTaskOutputs: string,
    objective: string,
  ): Promise<string> {
    if (
      typeof dependentTaskOutputs !== 'string' ||
      typeof objective !== 'string'
    ) {
      throw new Error('Invalid inputs');
    }

    const callback = (message: string) => {
      statusMessage += message;
      this.messageCallback({
        type: 'search-logs',
        text: '```markdown\n' + statusMessage + '\n```',
        title: `🔎 ${translate('SEARCH_LOGS', 'message')}`,
        id: task.id,
        icon: '🌐',
        open: false,
      });
    };

    let statusMessage = '- Extracting URLs from the task.\n';
    // Extract URLs from the task (e.g. "'https://www.google.com', 'http://www.paulgraham.com/greatwork.html`)
    const prompt = `- Extracting URLs from the task.
    Return a comma-separated URL List.
    TASK: ${task.task}
    URLS:`;
    const urlString = await this.generateText(prompt, task, {
      callbacks: () => {},
    });
    callback(`  - URLs: ${urlString}\n`);

    const urls = urlString.split(',').map((url) => url.trim());
    const contents = await Promise.all(
      urls.map(async (url) => {
        callback(`- Reading: ${url} ...\n`);
        const content = await webScrapeTool(url, this.abortController.signal);
        if (content.length === 0) {
          callback(`  - Content: No content found.\n`);
          return { url, content: '' };
        }
        callback(
          `  - Content: ${content.slice(0, 100)} ...\n  - Content length: ${
            content.length
          }\n`,
        );
        return { url, content };
      }),
    );

    callback(`- Extracting relevant information from the web pages.\n`);
    const info = await Promise.all(
      contents.map(async (item) => {
        return (
          `URL: ${item.url}\n\n` +
          (await largeTextExtract(
            objective,
            item.content,
            task,
            this.isRunningRef,
            callback,
            this.abortController.signal,
          ))
        );
      }),
    );

    return info.join('\n\n');
  }
}

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
