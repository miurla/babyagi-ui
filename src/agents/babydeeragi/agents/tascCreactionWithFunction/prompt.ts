import { HumanChatMessage, SystemChatMessage } from 'langchain/schema';
import { ChatCompletionFunctions } from 'openai';

export const taskCreationChatMessages = (
  objective: string,
  websearchVar: string,
  userInputVar: string,
  language: string,
) => {
  const systemPrompt = `You are an expert task creation AI tasked with creating a  list of tasks as a JSON array, considering the ultimate objective of your team: ${objective}.
  Create new tasks based on the objective. Limit tasks types to those that can be completed with the available tools listed below. Task description should be detailed.
  Task description must be answered in ${language}.
  Current tool options are [text-completion] [${websearchVar}] [${userInputVar}].
  For tasks using [web-search], provide the search query, and only the search query to use (eg. not 'research waterproof shoes, but 'waterproof shoes'). Result will be a summary of relevant information from the first few articles.
  When requiring multiple searches, use the [web-search] multiple times. This tool will use the dependent task result to generate the search query if necessary.
  Use [user-input] sparingly and only if you need to ask a question to the user who set up the objective. The task description should be the question you want to ask the user.')
  dependent_task_ids should always be an empty array, or an array of numbers representing the task ID it should pull results from.
  Make sure all task IDs are in chronological order.
  `;

  const humanPrompt = `objective: ${objective}`;

  return [
    new SystemChatMessage(systemPrompt),
    new HumanChatMessage(humanPrompt),
  ];
};

export const taskCreationFunction: ChatCompletionFunctions = {
  name: 'create_tasks',
  description: 'Create tasks for the objective',
  parameters: {
    type: 'object',
    properties: {
      tasks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
            },
            task: {
              type: 'string',
            },
            tool: {
              type: 'string',
            },
            dependent_task_ids: {
              type: 'array',
              items: {
                type: 'integer',
              },
            },
            status: {
              type: 'string',
              enum: ['incomplete', 'complete'],
            },
            output: {
              type: 'string',
            },
          },
          required: [
            'id',
            'task',
            'tool',
            'dependent_task_ids',
            'status',
            'output',
          ],
        },
      },
    },
    required: ['tasks'],
    function_call: {
      name: 'create_tasks',
    },
  },
};
