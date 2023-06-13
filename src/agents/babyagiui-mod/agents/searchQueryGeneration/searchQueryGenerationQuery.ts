import { AgentTask } from '@/types';
import { PromptTemplate } from 'langchain/prompts';

export const searchQueryGenerationPrompt = () => {
  const taskPrompt = `Generate a search query that yields the best results for the given task.
  Never include anything other than the query.
  Don't enter anything other than queries except when using specific keywords.
  Your task: {task}\n OUTPUT:`;

  const prompt = new PromptTemplate({
    inputVariables: ['task'],
    template: taskPrompt,
  });

  return prompt;
};
