import { PromptTemplate } from 'langchain/prompts';

export const taskCreationPrompt = () => {
  const prompt = new PromptTemplate({
    inputVariables: [
      'objective',
      'websearch_var',
      'user_input_var',
      'language',
    ],
    template: `
    You are an expert task creation AI tasked with creating a  list of tasks as a JSON array, considering the ultimate objective of your team: {objective}. 
    Create new tasks based on the objective. Limit tasks types to those that can be completed with the available tools listed below. Task description should be detailed.
    Task description must be answered in {language}.
    Current tool options are [text-completion] {websearch_var} {user_input_var}.
    For tasks using [web-search], provide the search query, and only the search query to use (eg. not 'research waterproof shoes, but 'waterproof shoes'). Result will be a summary of relevant information from the first few articles.
    When requiring multiple searches, use the [web-search] multiple times. This tool will use the dependent task result to generate the search query if necessary.
    Use [user-input] sparingly and only if you need to ask a question to the user who set up the objective. The task description should be the question you want to ask the user.')
    dependent_task_ids should always be an empty array, or an array of numbers representing the task ID it should pull results from.
    Make sure all task IDs are in chronological order.\n
    EXAMPLE OBJECTIVE=Look up AI news from today (May 27, 2023) and write a poem.
    TASK LIST=[
  {{\"id\":1,\"task\":\"AI news today\",\"tool\":\"web-search\",\"dependent_task_ids\":[],\"status\":\"incomplete\",\"result\":null,\"result_summary\":null}},
  {{\"id\":2,\"task\":\"Summarize a news article\",\"tool\":\"text-completion\",\"dependent_task_ids\":[1],\"status\":\"incomplete\",\"result\":null,\"result_summary\":null}},
  {{\"id\":3,\"task\":\"Pick up important news\",\"tool\":\"text-completion\",\"dependent_task_ids\":[2],\"status\":\"incomplete\",\"result\":null,\"result_summary\":null}},
  {{\"id\":4,\"task\":\"Final summary report\",\"tool\":\"text-completion\",\"dependent_task_ids\":[1,2,3],\"status\":\"incomplete\",\"result\":null,\"result_summary\":null}}
    ]
    OBJECTIVE={objective}
    TASK LIST=
    `,
  });

  return prompt;
};
