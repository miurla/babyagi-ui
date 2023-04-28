import { OpenAI } from 'langchain/llms/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeClient } from '@pinecone-database/pinecone';
import { Task } from './agent';
import {
  TaskCreationChain,
  TaskExecutionChain,
  TaskPrioritizationChain,
} from '.';

const pineconeClient = async () => {
  const pinecone = new PineconeClient();
  await pinecone.init({
    apiKey: process.env.PINECONE_API_KEY ?? '',
    environment: process.env.PINECONE_ENVIRONMENT ?? '',
  });
  return pinecone;
};

export const executionAgent = async (
  objective: string,
  task: string,
  context: string[],
  modelName: string,
  openAIApiKey?: string,
) => {
  const model = new OpenAI({
    openAIApiKey,
    modelName,
    temperature: 0.7,
    maxTokens: 2000,
  });
  const chain = TaskExecutionChain.fromLLM({ llm: model });
  const response = await chain._call({
    objective,
    context,
    task,
  });
  return response.text;
};

export const taskCreationAgent = async (
  result: string,
  task_description: string,
  incomplete_tasks: string,
  objective: string,
  modelName: string,
  openAIApiKey?: string,
) => {
  const model = new OpenAI({ openAIApiKey, modelName, temperature: 0.5 });
  const chain = TaskCreationChain.fromLLM({ llm: model });
  const response = await chain._call({
    objective,
    result,
    task_description,
    incomplete_tasks,
  });
  const newTasks = (response.text as string).split('\n');
  return newTasks
    .filter((taskName) => taskName.trim())
    .map((taskName) => ({ taskName }));
};

export const prioritizationAgent = async (
  objective: string,
  taskID: number,
  taskNames: string,
  modelName: string,
  openAIApiKey?: string,
) => {
  const model = new OpenAI({ openAIApiKey, modelName, temperature: 0.5 });
  const chain = TaskPrioritizationChain.fromLLM({ llm: model });
  const response = await chain._call({
    objective,
    next_task_id: taskID,
    task_names: taskNames,
  });

  const newTasks = (response.text as string).split('\n');

  const prioritizedTaskList = [];
  for (const taskString of newTasks) {
    const taskParts = taskString.trim().split('.', 2);
    if (taskParts.length === 2) {
      const taskID = taskParts[0].trim();
      const taskName = taskParts[1].trim();
      prioritizedTaskList.push({ taskID, taskName });
    }
  }
  return prioritizedTaskList;
};

export const contextAgent = async (
  query: string,
  index: string,
  n: number,
  namespace?: string,
) => {
  const pinecone = await pineconeClient();
  const embedding = new OpenAIEmbeddings();
  const queryEmbedding = await embedding.embedQuery(query);
  const pineconeIndex = pinecone.Index(index);
  const results = await pineconeIndex.query({
    queryRequest: {
      vector: queryEmbedding,
      topK: n,
      includeMetadata: true,
      namespace,
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

export const enrichResult = async (
  task: Task,
  result: string,
  index: string,
  namespace?: string,
) => {
  const pinecone = await pineconeClient();
  const embedding = new OpenAIEmbeddings();
  const pineconeIndex = pinecone.Index(index);
  const enrichedResult = { data: result };
  const resultId = `result_${task.taskID}`;
  const vector = [enrichedResult.data];
  if (!vector) {
    return;
  }

  await pineconeIndex.upsert({
    upsertRequest: {
      vectors: [
        {
          id: resultId,
          values: (await embedding.embedDocuments(vector))[0] ?? [],
          metadata: { task: task.taskName, result },
        },
      ],
      namespace,
    },
  });
};
