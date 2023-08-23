import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

const JSON_FILES = ['example3', 'example4', 'example_deer'];
const JSON_FILES_FOR_DEV = [
  'example3',
  'example4',
  'example_deer',
  'example_code',
  'example_code_review',
];
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function fetchJsonFiles(targetJsonFiles: string[]) {
  let loadedObjectives: any[] = [];

  for (const jsonFile of targetJsonFiles) {
    const response = await fetch(
      `${BASE_URL}/api/json-provider?file=${jsonFile}`,
    );

    if (!response.ok) {
      console.error(`Error fetching ${jsonFile}: ${response.statusText}`);
      continue;
    }

    try {
      const data = await response.json();
      loadedObjectives.push(data);
    } catch (e) {
      console.error(`Error parsing JSON for ${jsonFile}: ${e}`);
    }
  }

  return loadedObjectives;
}

const getObjectivesExamples = async () => {
  const targetJsonFiles =
    process.env.NODE_ENV === 'development' ? JSON_FILES_FOR_DEV : JSON_FILES;
  const loadedObjectives = await fetchJsonFiles(targetJsonFiles);

  return loadedObjectives;
};

async function getEmbedding(
  text: string,
  modelName: string = 'text-embedding-ada-002',
  userApiKey?: string,
) {
  try {
    const embedding = new OpenAIEmbeddings({
      modelName,
      openAIApiKey: userApiKey,
    });
    return await embedding.embedQuery(text);
  } catch (e) {
    throw new Error(`error: ${e}`);
  }
}

function calculateSimilarity(embedding1: number[], embedding2: number[]) {
  if (!embedding1 || !embedding2) {
    throw new Error('Embedding is not defined');
  }

  const dotProduct = embedding1.reduce(
    (sum, a, i) => sum + a * embedding2[i],
    0,
  );
  const magnitude1 = Math.sqrt(embedding1.reduce((sum, a) => sum + a * a, 0));
  const magnitude2 = Math.sqrt(embedding2.reduce((sum, a) => sum + a * a, 0));
  return dotProduct / (magnitude1 * magnitude2);
}

export async function findMostRelevantObjective(
  userInput: string,
  userApiKey?: string,
) {
  const examples = await getObjectivesExamples();

  let maxSimilarity = -Infinity;
  let mostRelevantObjective = examples[2];

  // specific to project site
  if (process.env.BASE_URL === 'https://babyagi-ui.vercel.app') {
    return mostRelevantObjective;
  }

  const userInputEmbedding = await getEmbedding(
    userInput,
    'text-embedding-ada-002',
    userApiKey,
  );

  for (const example of examples) {
    try {
      const objectiveEmbedding = await getEmbedding(
        example.objective,
        'text-embedding-ada-002',
        userApiKey,
      );
      const similarity = calculateSimilarity(
        objectiveEmbedding,
        userInputEmbedding,
      );

      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        mostRelevantObjective = example;
      }
    } catch (e) {
      console.error(`Error in processing example: ${e}`);
    }
  }

  return mostRelevantObjective;
}
