import { AgentTask, Message } from '@/types';
import _ from 'lodash';
import json from './example_objectives/example3.json';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { parseTasks } from '@/utils/task';
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema';
import { getUserApiKey } from '@/utils/settings';
import { translate } from '@/utils/translate';

interface ExampleObjective {
  objective: string;
  examples: AgentTask[];
}

export class TaskRegistry {
  tasks: AgentTask[];
  verbose: boolean = false;

  constructor(verbose = false) {
    this.tasks = [];
    this.verbose = verbose;
  }

  async createTaskList(
    objective: string,
    skillDescriptions: string,
    messageCallback?: (message: Message) => void,
    abortController?: AbortController,
  ): Promise<void> {
    const exapmleObjective = json.objective;
    const exampleTaskList = json.examples;
    const prompt = `
    You are an expert task list creation AI tasked with creating a  list of tasks as a JSON array, considering the ultimate objective of your team: ${objective}.
    Create a very short task list based on the objective, the final output of the last task will be provided back to the user. Limit tasks types to those that can be completed with the available skills listed below. Task description should be detailed.###
    AVAILABLE SKILLS: ${skillDescriptions}.###
    RULES:
    Do not use skills that are not listed.
    Always include one skill.
    dependent_task_ids should always be an empty array, or an array of numbers representing the task ID it should pull results from.
    Make sure all task IDs are in chronological order.###\n
    EXAMPLE OBJECTIVE=${exapmleObjective}
    TASK LIST=${JSON.stringify(exampleTaskList)}
    OBJECTIVE=${objective}
    TASK LIST=`;
    const systemPrompt = 'You are a task creation AI.';
    const systemMessage = new SystemChatMessage(systemPrompt);
    const messages = new HumanChatMessage(prompt);
    const openAIApiKey = getUserApiKey();

    if (!openAIApiKey && process.env.NEXT_PUBLIC_USE_USER_API_KEY === 'true') {
      throw new Error('User API key is not set.');
    }

    let chunk = '```json\n';
    const model = new ChatOpenAI(
      {
        openAIApiKey,
        modelName: 'gpt-3.5-turbo',
        temperature: 0,
        maxTokens: 1500,
        topP: 1,
        verbose: this.verbose,
        streaming: true,
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              chunk += token;
              const message: Message = {
                type: 'task-execute',
                title: translate('CREATING', 'message'),
                text: chunk,
                icon: '📝',
                id: 0,
              };
              messageCallback?.(message);
            },
          },
        ],
      },
      { baseOptions: { signal: abortController?.signal } },
    );

    const response = await model.call([systemMessage, messages]);
    const result = response.text;
    this.tasks = parseTasks(result);
  }

  async executeTask(
    i: number,
    task: AgentTask,
    // skillRegistry: SkillRegistry,
    taskOutputs: any,
    objective: string,
  ): Promise<any> {
    // let skill = skillRegistry.getSkill(task.skill);
    // let dependentTaskOutputs: any = {};
    // if (task.dependentTaskIds) {
    //   for (let id of task.dependentTaskIds) {
    //     if (id in taskOutputs) {
    //       dependentTaskOutputs[id] = taskOutputs[id];
    //     }
    //   }
    // }
    // let taskOutput = await skill.execute(
    //   task.task,
    //   dependentTaskOutputs,
    //   objective,
    // );
    // return [i, taskOutput];
  }

  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    let sum = _.zip(embedding1, embedding2)
      .filter(([x, y]) => x !== undefined && y !== undefined)
      .reduce((sum: number, [x, y]) => sum + (x as number) * (y as number), 0);
    let mag1 = Math.sqrt(_.sum(embedding1.map((x: number) => x * x)));
    let mag2 = Math.sqrt(_.sum(embedding2.map((x: number) => x * x)));
    return sum / (mag1 * mag2);
  }

  getTasks(): AgentTask[] {
    return this.tasks;
  }

  getTask(taskId: number): AgentTask | undefined {
    return this.tasks.find((task) => task.id === taskId);
  }

  addTask(task: AgentTask, afterTaskId: number): void {
    let index = this.tasks.findIndex((t) => t.id === afterTaskId);
    if (index !== -1) {
      this.tasks.splice(index + 1, 0, task);
    } else {
      this.tasks.push(task);
    }
  }

  printTaskList(): void {
    console.log(this.tasks);
  }

  updateTasks(taskUpdate: { id: number; updates: Partial<AgentTask> }): void {
    let task = this.getTask(taskUpdate.id);
    if (task) {
      Object.assign(task, taskUpdate.updates);
    }
  }

  reorderTasks(): void {
    this.tasks = _.sortBy(this.tasks, ['priority', 'task_id']);
  }

  // *** TODO: Implement reflectOnOutput in TypeScript *** //
  async reflectOnOutput(
    taskOutput: any,
    skillDescriptions: string,
  ): Promise<void> {
    // This method involves significant logic in the Python version and would require a careful conversion.
    // For now, it's just a placeholder to show where this method would go.
  }
}
