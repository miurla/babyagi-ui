import { AgentTask } from '@/types';
import { Skill } from '../skill';
import axios from 'axios';

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
        Dependent tasks output: ${dependentTaskOutputs}
        Objective: ${objective}
      `;
    const query = await this.generateText(prompt, task);
    const searchResults = await this.webSearchTool(`site:youtube.com ${query}`);
    const youtubeLinks = this.extractYoutubeLinks(searchResults);

    return '```json\n' + JSON.stringify(youtubeLinks, null, 2) + '\n```';
  }

  webSearchTool = async (query: string) => {
    const response = await axios
      .post(
        '/api/tools/search',
        {
          query,
        },
        {
          signal: this.abortController.signal,
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
