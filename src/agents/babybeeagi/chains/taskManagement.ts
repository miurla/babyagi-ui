import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';
import { LLMChain, LLMChainInput } from 'langchain/chains';

export class TaskManagementChain extends LLMChain {
  static fromLLM(fields: Omit<LLMChainInput, 'prompt'>): LLMChain {
    const taskManagementTemplate = `You are a task management AI tasked with cleaning the formatting of and reprioritizing the following tasks: {minified_task_list}. 
      Consider the ultimate objective of your team: {objective}. 
      Do not remove any tasks. Task description must be answered in {language}. Return the result as a JSON-formatted list of dictionaries.\n
      Create new tasks based on the result of last task if necessary for the objective. Limit tasks types to those that can be completed with the available tools listed below. Task description should be detailed.
      The maximum task list length is 7. Do not add an 8th task.
      The last completed task has the following result: {result}. 
      Current tool option is [text-completion] {websearch_var} and [web-scrape] only.
      For tasks using [web-scrape], provide only the URL to scrape as the task description. Do not provide placeholder URLs, but use ones provided by a search step or the initial objective.
      For tasks using [web-search], provide the search query, and only the search query to use (eg. not 'research waterproof shoes, but 'waterproof shoes')
      dependent_task_id should always be null or a number.
      Do not reorder completed tasks. Only reorder and dedupe incomplete tasks.\n
      Make sure all task IDs are in chronological order.\n
      Do not provide example URLs for [web-scrape].\n
      Do not include the result from the last task in the JSON, that will be added after..\n
      The last step is always to provide a final summary report of all tasks.\n
      An example of the desired output format is: `;

    // json format is invalid in prompt template. so escape { to {{ and } to }}
    const jsonExamples =
      '[' +
      '{{"id": 1, "task": "https://untapped.vc", "tool": "web-scrape", "dependent_task_id": null, "status": "incomplete", "result": null, "result_summary": null}},' +
      '{{"id": 2, "task": "Analyze the contents of...", "tool": "text-completion", "dependent_task_id": 1, "status": "incomplete", "result": null, "result_summary": null}},' +
      '{{"id": 3, "task": "Untapped Capital", "tool": "web-search", "dependent_task_id": null, "status": "incomplete", "result": null, "result_summary": null}}' +
      '].';

    const prompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        'You are a task management AI tasked with cleaning the formatting of and reprioritizing. The response will return only JSON.',
      ),
      HumanMessagePromptTemplate.fromTemplate(
        taskManagementTemplate + jsonExamples,
      ),
    ]);

    prompt.inputVariables = [
      'minified_task_list',
      'objective',
      'result',
      'websearch_var',
      'language',
    ];

    return new TaskManagementChain({ prompt, ...fields });
  }
}
