import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';
import { LLMChain, LLMChainInput } from 'langchain/chains';

export class TaskCreationChain extends LLMChain {
  static fromLLM(fields: Omit<LLMChainInput, 'prompt'>): LLMChain {
    const taskCreationTemplate = `
    You are a task creation AI tasked with creating a list of tasks as a JSON array, considering the ultimate objective of your team: {objective}.
    Create new tasks based on the objective. Limit tasks types to those that can be completed with the available tools listed below. Task description should be detailed.
    Task description must be answered in {language}.
    Current tool option is [text-completion] {websearch_var} and only." # web-search is added automatically if SERPAPI exists
    For tasks using [web-search], provide the search query, and only the search query to use (eg. not 'research waterproof shoes, but 'waterproof shoes')
    dependent_task_ids should always be an empty array, or an array of numbers representing the task ID it should pull results from.
    Make sure all task IDs are in chronological order.\n
    The last step is always to provide a final summary report including tasks executed and summary of knowledge acquired.\n
    Do not create any summarizing steps outside of the last step..\n
    An example of the desired output format is:
    [{{\"id\": 1, \"task\": \"https://untapped.vc\", \"tool\": \"web-scrape\", \"dependent_task_ids\": [], \"status\": \"incomplete\", \"output\": null}}, 
    {{\"id\": 2, \"task\": \"Consider additional insights that can be reasoned from the results of...\", \"tool\": \"text-completion\", \"dependent_task_ids\": [1], \"status\": \"incomplete\", \"output\": null}}, 
    {{\"id\": 3, \"task\": \"Untapped Capital\", \"tool\": \"web-search\", \"dependent_task_ids\": [], \"status\": \"incomplete\", \"output\": null}}].\n
    JSON TASK LIST=
    `;

    const prompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate('You are a task creation AI.'),
      HumanMessagePromptTemplate.fromTemplate(taskCreationTemplate),
    ]);

    prompt.inputVariables = ['objective', 'websearch_var', 'language'];

    return new TaskCreationChain({ prompt, ...fields });
  }
}
