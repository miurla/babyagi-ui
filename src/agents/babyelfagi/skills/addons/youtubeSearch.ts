import { AgentTask } from '@/types';
import { Skill } from '../skill';
import { webSearch } from '../../tools/webSearch';

export class YoutubeSearch extends Skill {
  name = 'youtube_search';
  descriptionForHuman = 'This skill searches YouTube for videos.';
  descriptionForModel =
    'This skill searches YouTube for videos. Returns a list of links.';
  icon = '📺';

  async execute(
    task: AgentTask,
    dependentTaskOutputs: string,
    objective: string,
  ): Promise<string> {
    const prompt = `Generate query for YouTube search based on the dependent task outputs and the objective.
    Dont include "Youtube video". Only include the query.
    Dependent tasks output: ${dependentTaskOutputs}
    Objective: ${objective}
      `;
    const query = await this.generateText(prompt, task);
    const searchResults = await webSearch(`site:youtube.com ${query}`);
    const youtubeLinks = this.extractYoutubeLinks(searchResults);
    const result = JSON.stringify(youtubeLinks, null, 2);

    this.callbackMessage({
      taskId: task.id.toString(),
      content: '```json\n\n' + result + '\n\n```',
      type: task.skill,
      style: 'text',
      status: 'complete',
    });

    return result;
  }

  extractYoutubeLinks = (searchResults: any[]) => {
    const youtubeLinks = searchResults
      .filter((result) => {
        return result?.link.includes('youtube.com/watch?v=');
      })
      .map((result) => {
        return {
          position: result?.position || 0,
          title: result?.title || '',
          link: result?.link || '',
          snippet: result?.snippet || '',
        };
      });
    return youtubeLinks;
  };
}
