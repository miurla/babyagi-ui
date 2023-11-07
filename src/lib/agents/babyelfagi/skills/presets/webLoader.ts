import { AgentTask } from '@/types';
import { Skill } from '../skill';
import { largeTextExtract } from '@/lib/agents/babyelfagi/tools/utils/largeTextExtract';
import { webScrape } from '../../tools/webScrape';
import { v4 as uuidv4 } from 'uuid';

export class WebLoader extends Skill {
  name = 'web_loader';
  descriptionForHuman =
    'This skill extracts URLs from the task and returns the contents of the web pages of those URLs.';
  descriptionForModel =
    'This skill extracts URLs from the task and returns the contents of the web pages of those URLs.';
  icon = '🌐';

  async execute(
    task: AgentTask,
    dependentTaskOutputs: string,
    objective: string,
    modelName?: string,
  ): Promise<string> {
    if (typeof objective !== 'string') {
      throw new Error('Invalid inputs');
    }

    let message = '- Extracting URLs from the task.\n';
    const callback = (
      message: string,
      status: 'running' | 'complete' | 'incomplete' = 'running',
    ) => {
      this.handleMessage({
        id: this.id,
        taskId: task.id.toString(),
        content: message,
        type: this.name,
        style: 'log',
        status,
      });
    };

    const urlString = await this.extractUrlsFromTask(task, callback, modelName);
    const urls = urlString.split(',').map((url) => url.trim());
    const contents = await this.fetchContentsFromUrls(urls, callback);
    const info = await this.extractInfoFromContents(
      contents,
      objective,
      task,
      modelName,
    );
    this.handleMessage({
      id: uuidv4(),
      taskId: task.id.toString(),
      content: info.join('\n\n'),
      type: this.name,
      style: 'text',
      status: 'complete',
    });
    callback('- Completed: Extract info from contents', 'complete');

    return info.join('\n\n');
  }

  private async extractUrlsFromTask(
    task: AgentTask,
    callback: (message: string) => void,
    modelName: string = 'gpt-3.5-turbo',
  ): Promise<string> {
    const prompt = `Extracting URLs from the task.\nReturn a comma-separated URL List.\nTASK: ${task.task}\nURLS:`;
    const urlString = await this.generateText(
      prompt,
      task,
      { modelName },
      true,
    );
    callback(`  - URLs: ${urlString}\n`);
    return urlString;
  }

  private async fetchContentsFromUrls(
    urls: string[],
    callback: (message: string) => void,
  ): Promise<{ url: string; content: string }[]> {
    const MAX_URLS = 10;
    return await Promise.all(
      urls.slice(0, MAX_URLS).map(async (url) => {
        callback(`- Reading: ${url} ...\n`);
        const content = await webScrape(url);
        if (!content || content.length === 0) {
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
    modelName: string = 'gpt-3.5-turbo',
  ): Promise<string[]> {
    return await Promise.all(
      contents.map(async (item) => {
        return (
          `URL: ${item.url}\n\n` +
          (await largeTextExtract(
            this.id,
            objective,
            item.content,
            task,
            this.apiKeys.openai,
            this.handleMessage,
            this.abortSignal,
            modelName,
          ))
        );
      }),
    );
  }
}
