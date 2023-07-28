import { getUserApiKey } from '@/utils/settings';
import axios from 'axios';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

const CURRENT_OBJECTIVES_VERSION = '1.0.0';
const JSON_FILES = ['example3', 'example4', 'example_deer'];
const JSON_FILES_FOR_DEV = [
  'example3',
  'example4',
  'example_deer',
  'example_code',
  'example_code_review',
];

async function fetchJsonFiles(targetJsonFiles: string[]) {
  let loadedObjectives: any[] = [];

  for (const jsonFile of targetJsonFiles) {
    const response = await fetch(`/api/json-provider?file=${jsonFile}`);
    const data = await response.json();
    loadedObjectives.push(data);
  }

  return loadedObjectives;
}

const getObjectivesExamples = async () => {
  const storedObjectives = localStorage.getItem('BABYAGIUI_OBJECTIVES');

  if (storedObjectives) {
    const data = JSON.parse(storedObjectives);
    if (data.version === CURRENT_OBJECTIVES_VERSION) {
      return data.objectives;
    }
  }

  const targetJsonFiles =
    process.env.NODE_ENV === 'development' ? JSON_FILES_FOR_DEV : JSON_FILES;
  const loadedObjectives = await fetchJsonFiles(targetJsonFiles);

  const data = {
    version: CURRENT_OBJECTIVES_VERSION,
    objectives: loadedObjectives,
  };

  localStorage.setItem('BABYAGIUI_OBJECTIVES', JSON.stringify(data));

  return loadedObjectives;
};

async function getEmbedding(
  text: string,
  modelName: string = 'text-embedding-ada-002',
) {
  const openAIApiKey = getUserApiKey();
  if (!openAIApiKey && process.env.NEXT_PUBLIC_USE_USER_API_KEY === 'true') {
    throw new Error('User API key is not set.');
  }

  if (openAIApiKey) {
    const embedding = new OpenAIEmbeddings({
      modelName,
      openAIApiKey: getUserApiKey(),
    });
    return await embedding.embedQuery(text);
  } else {
    const response = await axios.post(
      '/api/elf/embedding',
      {
        text: text,
        model_name: modelName,
      },
      {
        signal: new AbortController().signal,
      },
    );
    return response.data.response;
  }
}

function calculateSimilarity(embedding1: number[], embedding2: number[]) {
  const dotProduct = embedding1.reduce(
    (sum, a, i) => sum + a * embedding2[i],
    0,
  );
  const magnitude1 = Math.sqrt(embedding1.reduce((sum, a) => sum + a * a, 0));
  const magnitude2 = Math.sqrt(embedding2.reduce((sum, a) => sum + a * a, 0));
  return dotProduct / (magnitude1 * magnitude2);
}

export async function findMostRelevantObjective(userInput: string) {
  const userInputEmbedding = await getEmbedding(
    userInput,
    'text-embedding-ada-002',
  );
  const examples = await getObjectivesExamples();

  let maxSimilarity = -Infinity;
  let mostRelevantObjective = null;

  for (const example of examples) {
    const objectiveEmbedding = await getEmbedding(example.objective);
    const similarity = calculateSimilarity(
      objectiveEmbedding,
      userInputEmbedding,
    );

    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      mostRelevantObjective = example;
    }
  }

  return mostRelevantObjective;
}
