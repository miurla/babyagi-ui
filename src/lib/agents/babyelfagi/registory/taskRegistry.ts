import { AgentTask, AgentMessage, TaskOutputs } from '@/types';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { parseTasks } from '@/utils/task';
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema';
import { SkillRegistry } from './skillRegistry';
import { findMostRelevantObjective } from '@/utils/objective';
export class TaskRegistry {
  tasks: AgentTask[];
  verbose: boolean = false;
  language: string = 'en';
  useSpecifiedSkills: boolean = false;
  userApiKey?: string;
  signal?: AbortSignal;

  constructor(
    language = 'en',
    verbose = false,
    useSpecifiedSkills = false,
    userApiKey?: string,
    signal?: AbortSignal,
  ) {
    this.tasks = [];
    this.verbose = verbose;
    this.language = language;
    this.userApiKey = userApiKey;
    this.useSpecifiedSkills = useSpecifiedSkills;
    this.signal = signal;
  }

  async createTaskList(
    id: string,
    objective: string,
    skillDescriptions: string,
    modelName: string = 'gpt-3.5-turbo',
    handleMessage: (message: AgentMessage) => Promise<void>,
  ): Promise<void> {
    const relevantObjective = await findMostRelevantObjective(
      objective,
      this.userApiKey,
    );
    if (!relevantObjective) {
      console.error('No relevant objective found');
      return;
    }

    const exapmleObjective = relevantObjective.objective;
    const exampleTaskList = relevantObjective.examples;
    const prompt = `
    You are an expert task list creation AI tasked with creating a  list of tasks as a JSON array, considering the ultimate objective of your team: ${objective}.
    Create a very short task list based on the objective, the final output of the last task will be provided back to the user. Limit tasks types to those that can be completed with the available skills listed below. Task description should be detailed.###
    AVAILABLE SKILLS: ${skillDescriptions}.###
    RULES:
    Do not use skills that are not listed.
    Always include one skill.
    Do not create files unless specified in the objective.
    dependent_task_ids should always be an empty array, or an array of numbers representing the task ID it should pull results from.
    Make sure all task IDs are in chronological order.###
    Output must be answered in ${this.language}.
    EXAMPLE OBJECTIVE=${exapmleObjective}
    TASK LIST=${JSON.stringify(exampleTaskList)}
    OBJECTIVE=${objective}
    TASK LIST=`;
    const systemPrompt = 'You are a task creation AI.';
    const systemMessage = new SystemChatMessage(systemPrompt);
    const messages = new HumanChatMessage(prompt);

    let result = '';
    const model = new ChatOpenAI(
      {
        openAIApiKey: this.userApiKey,
        modelName,
        temperature: 0,
        maxTokens: 1500,
        topP: 1,
        verbose: false, // You can set this to true to see the lanchain logs
        streaming: true,
        maxRetries: 2,
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              const message: AgentMessage = {
                id,
                content: token,
                type: 'task-list',
                style: 'log',
                status: 'running',
              };
              handleMessage(message);
            },
          },
        ],
      },
      { baseOptions: { signal: this.signal } },
    );

    try {
      const response = await model.call([systemMessage, messages]);
      result = response.text;
      // markdown is now appended (remove when langchain supports json mode)
      if (result.startsWith('```json')) {
        result = result.slice(7);
      }
      if (result.endsWith('```')) {
        result = result.slice(0, -3);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Task creation aborted');
      }
      console.log(error);
    }

    if (result === undefined) {
      console.log('error');
      return;
    }

    this.tasks = parseTasks(result);
  }

  async executeTask(
    i: number,
    task: AgentTask,
    taskOutputs: TaskOutputs,
    objective: string,
    skillRegistry: SkillRegistry,
    modelName: string,
  ): Promise<string> {
    const skill = skillRegistry.getSkill(task.skill ?? '');
    const dependentTaskOutputs = task.dependentTaskIds
      ? task.dependentTaskIds.map((id) => taskOutputs[id].output).join('\n')
      : '';

    return await skill.execute(
      task,
      dependentTaskOutputs,
      objective,
      modelName,
    );
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

  updateTasks(taskUpdate: { id: number; updates: Partial<AgentTask> }): void {
    let task = this.getTask(taskUpdate.id);
    if (task) {
      Object.assign(task, taskUpdate.updates);
    }
  }

  reorderTasks(): void {
    this.tasks.sort((a, b) => a.id - b.id);
  }

  async reflectOnOutput(
    objective: string,
    taskOutput: string,
    skillDescriptions: string,
    modelName: string = 'gpt-4-1106-preview',
  ): Promise<[AgentTask[], number[], AgentTask[]]> {
    const example = [
      [
        {
          id: 3,
          task: 'New task 1 description',
          skill: 'text_completion',
          icon: '🤖',
          dependent_task_ids: [],
          status: 'complete',
        },
        {
          id: 4,
          task: 'New task 2 description',
          skill: 'text_completion',
          icon: '🤖',
          dependent_task_ids: [],
          status: 'incomplete',
        },
      ],
      [2, 3],
      [
        {
          id: 5,
          task: 'Complete the objective and provide a final report',
          skill: 'text_completion',
          icon: '🤖',
          dependent_task_ids: [1, 2, 3, 4],
          status: 'incomplete',
        },
      ],
    ];

    const prompt = `You are an expert task manager, review the task output to decide at least one new task to add.
  As you add a new task, see if there are any tasks that need to be updated (such as updating dependencies).
  Use the current task list as reference. 
  considering the ultimate objective of your team: ${objective}. 
  Do not add duplicate tasks to those in the current task list.
  Only provide JSON as your response without further comments.
  Every new and updated task must include all variables, even they are empty array.
  Dependent IDs must be smaller than the ID of the task.
  New tasks IDs should be no larger than the last task ID.
  Always select at least one skill.
  Task IDs should be unique and in chronological order.
  Do not change the status of complete tasks.
  Only add skills from the AVAILABLE SKILLS, using the exact same spelling.
  Provide your array as a JSON array with double quotes. The first object is new tasks to add as a JSON array, the second array lists the ID numbers where the new tasks should be added after (number of ID numbers matches array), The number of elements in the first and second arrays will always be the same. 
  And the third array provides the tasks that need to be updated.
  Make sure to keep dependent_task_ids key, even if an empty array.
  OBJECIVE: ${objective}.
  AVAILABLE SKILLS: ${skillDescriptions}.
  Here is the last task output: ${taskOutput}
  Here is the current task list: ${JSON.stringify(this.tasks)}
  EXAMPLE OUTPUT FORMAT = ${JSON.stringify(example)}
  OUTPUT = `;

    console.log(
      '\nReflecting on task output to generate new tasks if necessary...\n',
    );

    const model = new ChatOpenAI({
      openAIApiKey: this.userApiKey,
      modelName,
      temperature: 0.7,
      maxTokens: 1500,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    });

    const response = await model.call([
      new SystemChatMessage('You are a task creation AI.'),
      new HumanChatMessage(prompt),
    ]);

    const result = response.text;
    console.log('\n' + result);

    // Check if the returned result has the expected structure
    if (typeof result === 'string') {
      try {
        const taskList = JSON.parse(result);
        console.log(taskList);
        return [taskList[0], taskList[1], taskList[2]];
      } catch (error) {
        console.error(error);
      }
    } else {
      throw new Error('Invalid task list structure in the output');
    }

    return [[], [], []];
  }
}
