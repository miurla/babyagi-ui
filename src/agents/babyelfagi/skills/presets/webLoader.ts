import { AgentTask } from '@/types';
import { Skill } from '../skill';
import axios from 'axios';
import { largeTextExtract } from '@/agents/babydeeragi/tools/largeTextExtract';
import { translate } from '@/utils/translate';

export class WebLoader extends Skill {
  name = 'web_loader';
  descriptionForHuman = 'This skill loas web pages from provided URLs.';
  descriptionForModel =
    'This skill loads web pages from provided URLs. Returns the web page content.';
  icon = '🌐';

  async execute(task: AgentTask, objective: string): Promise<string> {
    if (typeof objective !== 'string') {
      throw new Error('Invalid inputs');
    }

    let statusMessage = '- Extracting URLs from the task.\n';
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

    const urlString = await this.extractUrlsFromTask(task, callback);
    const urls = urlString.split(',').map((url) => url.trim());
    const contents = await this.fetchContentsFromUrls(urls, callback);
    const info = await this.extractInfoFromContents(
      contents,
      objective,
      task,
      callback,
    );

    return info.join('\n\n');
  }

  private async extractUrlsFromTask(
    task: AgentTask,
    callback: (message: string) => void,
  ): Promise<string> {
    const prompt = `- Extracting URLs from the task.\nReturn a comma-separated URL List.\nTASK: ${task.task}\nURLS:`;
    const urlString = await this.generateText(prompt, task, undefined, true);
    callback(`  - URLs: ${urlString}\n`);
    return urlString;
  }

  private async fetchContentsFromUrls(
    urls: string[],
    callback: (message: string) => void,
  ): Promise<{ url: string; content: string }[]> {
    return await Promise.all(
      urls.map(async (url) => {
        callback(`- Reading: ${url} ...\n`);
        const content = await this.webScrapeTool(url);
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
  }

  private async extractInfoFromContents(
    contents: { url: string; content: string }[],
    objective: string,
    task: AgentTask,
    callback: (message: string) => void,
  ): Promise<string[]> {
    callback(`- Extracting relevant information from the web pages.\n`);
    return await Promise.all(
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
  }

  private async webScrapeTool(url: string): Promise<string> {
    try {
      const response = await axios.post(
        '/api/tools/scrape',
        { url },
        { signal: this.abortController.signal },
      );
      return response?.data?.response;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Request aborted', error.message);
      } else {
        console.error(error.message);
      }
      return '';
    }
  }
}
