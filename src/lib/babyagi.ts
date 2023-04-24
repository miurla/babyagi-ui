import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import { PineconeClient } from '@pinecone-database/pinecone';

// Set API Keys
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is missing from .env');
}

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
if (!PINECONE_API_KEY) {
  throw new Error('PINECONE_API_KEY environment variable is missing from .env');
}

const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
if (!PINECONE_ENVIRONMENT) {
  throw new Error(
    'PINECONE_ENVIRONMENT environment variable is missing from .env',
  );
}

const YOUR_TABLE_NAME = process.env.TABLE_NAME || 'baby-agi-test-table';

// Use GPT-3.x model
const USE_GPT4 = false;
if (USE_GPT4) {
  console.log(
    '\x1b[31m',
    '\n*****USING GPT-4. POTENTIALLY EXPENSIVE. MONITOR YOUR COSTS*****\n',
    '\x1b[39m',
  );
}

// Configure OpenAI and Pinecone
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const pinecone = new PineconeClient();

// Create Pinecone index
const tableName = YOUR_TABLE_NAME;
const dimension = 1536;
const metric = 'cosine';
const podType = 'p1';

// Task list
type Task = {
  taskId: number;
  taskName: string;
};

let taskList: Task[] = [];

const addTask = (task: Task) => {
  taskList.push(task);
};

const getAdaEmbedding = async (text: string) => {
  text = text.replace('\n', ' ');
  const response = await openai.createEmbedding({
    input: [text],
    model: 'text-embedding-ada-002',
  });
  return response.data.data[0].embedding;
};

const openaiCall = async (
  prompt: string,
  gptVersion: string, // change useGpt4 to gptVersion
  temperature: number = 0.5,
  maxTokens: number = 100,
) => {
  if (gptVersion.startsWith('text-')) {
    // Use GPT-3 DaVinci model
    const response = await openai.createCompletion({
      model: gptVersion,
      prompt,
      temperature,
      max_tokens: maxTokens,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    return response.data.choices[0].text?.trim();
  } else {
    // Use GPT-4 chat model
    const messages: ChatCompletionRequestMessage[] = [
      { role: 'user', content: prompt },
    ];
    const response = await openai.createChatCompletion({
      model: gptVersion,
      messages,
      temperature,
      max_tokens: maxTokens,
      n: 1,
    });
    return response.data.choices[0].message?.content.trim();
  }
};

const taskCreationAgent = async (
  objective: string,
  result: any,
  taskDescription: string,
  taskList: string[],
  gptVersion: string,
) => {
  const prompt = `You are an task creation AI that uses the result of an execution agent to create new tasks with the following objective: ${objective}, The last completed task has the result: ${result}. This result was based on this task description: ${taskDescription}. These are incomplete tasks: ${taskList.join(
    ', ',
  )}. Based on the result, create new tasks to be completed by the AI system that do not overlap with incomplete tasks. Return the tasks as an array.`;
  const response = await openaiCall(prompt, gptVersion);
  const newTasks = response?.split('\n');
  return newTasks?.map((taskName) => ({ taskName, taskId: 0 }));
};

const prioritizationAgent = async (
  objective: string,
  thisTaskId: number,
  gptVersion: string,
) => {
  const taskNames = taskList.map((t) => t.taskName);
  const nextTaskId = thisTaskId + 1;
  const prompt = `You are an task prioritization AI tasked with cleaning the formatting of and reprioritizing the following tasks: ${taskNames}. Consider the ultimate objective of your team:${objective}. Do not remove any tasks. Return the result as a numbered list, like:
    #. First task
    #. Second task
    Start the task list with number ${nextTaskId}.`;
  const response = await openaiCall(prompt, gptVersion);
  const newTasks = response?.split('\n').map((taskString) => {
    const [taskId, taskName] = taskString
      .trim()
      .split('.', 2)
      .map((x) => x.trim());
    return { taskId, taskName };
  });
  taskList = [];
  if (!newTasks) {
    return;
  }
  for (const task of newTasks) {
    taskList.push({ taskId: parseInt(task.taskId), taskName: task.taskName });
  }
};

const executionAgent = async (
  objective: string,
  task: string,
  gptVersion: string = 'gpt-3',
) => {
  const context = await contextAgent(objective, YOUR_TABLE_NAME, 5);
  const prompt = `You are an AI who performs one task based on the following objective: ${objective}.\nTake into account these previously completed tasks: ${context}\nYour task: ${task}\nResponse:`;
  return openaiCall(prompt, gptVersion, 0.7, 2000);
};

const contextAgent = async (query: string, index: string, n: number) => {
  const queryEmbedding = await getAdaEmbedding(query);
  const pineconeIndex = pinecone.Index(index);
  const results = await pineconeIndex.query({
    queryRequest: {
      vector: queryEmbedding,
      topK: n,
      includeMetadata: true,
    },
  });

  if (!results.matches) {
    return [];
  }

  const sortedResults = results.matches.sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0),
  );
  return sortedResults
    .map((item) => (item.metadata as { task: string })?.task)
    .filter((task) => task !== undefined);
};

export const startAgent = async (
  objective: string = 'Solve world hunger',
  firstTask: string = 'Develop a task list',
  model: string = 'gpt-3',
  iterations: number = 0,
  outputCallback: (output: string) => void,
  stopSignal: () => boolean,
) => {
  // Print the objective
  console.log('\x1b[36m', '\n*****OBJECTIVE*****\n', '\x1b[39m');
  console.log(objective);
  const objectiveString = `*****OBJECTIVE*****\n\n${objective}\n`;
  outputCallback(objectiveString);

  // Initialize Pinecone
  await pinecone.init({
    apiKey: PINECONE_API_KEY,
    environment: PINECONE_ENVIRONMENT,
  });
  const pineconeIndexList = await pinecone.listIndexes();

  if (!pineconeIndexList.includes(tableName)) {
    await pinecone.createIndex({
      createRequest: { name: tableName, dimension, metric, podType: podType },
    });
  }

  // Connect to the index
  const index = await pinecone.Index(tableName);

  // Reset the task list and counters
  const reset = () => {
    taskList = [];
    taskIdCounter = 1;
    iterationCounter = 0;
  };

  // Add the first task
  addTask({ taskId: 1, taskName: firstTask });

  // Main loop
  let taskIdCounter = 1;
  let iterationCounter = 0;

  // execute the main loop
  while (iterations === 0 || iterationCounter < iterations) {
    if (stopSignal()) {
      reset();
      return;
    }

    if (taskList.length > 0) {
      // print the task list
      console.log('\x1b[35m', '\n*****TASK LIST*****\n', '\x1b[39m');
      taskList.forEach((t) => console.log(`${t.taskId}. ${t.taskName}`));
      // Output the task list
      let taskListString = '';
      taskListString += `*****TASK LIST*****\n\n`;
      taskList.forEach(
        (t) => (taskListString += `${t.taskId}. ${t.taskName} \n`),
      );
      outputCallback(taskListString);

      // Step 1: Pull the first task
      const task = taskList.shift();
      console.log('\x1b[32m', '\n*****NEXT TASK*****\n', '\x1b[39m');
      if (!task) {
        continue;
      }
      console.log(`${task.taskId}. ${task.taskName}`);
      // Output the next task
      let nextTaskString = '';
      nextTaskString += `*****NEXT TASK*****\n\n`;
      nextTaskString += `${task.taskId}. ${task.taskName}`;
      outputCallback(nextTaskString);

      // Send to execution function to complete the task based on the context
      const result = await executionAgent(objective, task.taskName, model);
      const thisTaskId = task.taskId;
      console.log('\x1b[33m', '\n*****TASK RESULT*****\n', '\x1b[39m');
      console.log(result);
      // Output the task result
      let taskResultString = '';
      taskResultString += `*****TASK RESULT*****\n\n`;
      taskResultString += result ?? '';
      outputCallback(taskResultString);

      // Step 2: Enrich the result and store in Pinecone
      const enrichedResult = { data: result };
      const resultId = `result_${task.taskId}`;
      const vector = enrichedResult.data;
      if (!vector) {
        continue;
      }
      await index.upsert({
        upsertRequest: {
          vectors: [
            {
              id: resultId,
              values: await getAdaEmbedding(vector),
              metadata: { task: task.taskName, result },
            },
          ],
        },
      });

      // Step 3: Create new tasks and reprioritize the task list
      const newTasks = await taskCreationAgent(
        objective,
        enrichedResult,
        task.taskName,
        taskList.map((t) => t.taskName),
        model,
      );
      if (!newTasks) {
        continue;
      }

      newTasks.forEach((newTask) => {
        taskIdCounter += 1;
        newTask.taskId = taskIdCounter;
        addTask(newTask);
      });
      await prioritizationAgent(objective, thisTaskId, model);
    }

    iterationCounter += 1;
    if (iterations > 0 && iterationCounter >= iterations) {
      outputCallback('*****END OF ITERATIONS*****');
      reset();
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Sleep before checking the task list again
  }
};
