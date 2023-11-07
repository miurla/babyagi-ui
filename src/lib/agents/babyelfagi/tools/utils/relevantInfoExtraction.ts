import { OpenAIChat } from 'langchain/llms/openai';
import { LLMChain } from 'langchain/chains';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';

export const relevantInfoExtraction = async (
  objective: string,
  task: string,
  notes: string,
  chunk: string,
  userApiKey?: string,
  signal?: AbortSignal,
  model?: string,
) => {
  const modelName =
    model === 'gpt-4-1106-preview' ? model : 'gpt-3.5-turbo-16k';
  const prompt = relevantInfoExtractionPrompt();
  const llm = new OpenAIChat(
    {
      modelName,
      openAIApiKey: userApiKey,
      temperature: 0.7,
      maxTokens: 800,
      topP: 1,
      stop: ['###'],
    },
    { baseOptions: { signal: signal } },
  );
  const chain = new LLMChain({ llm: llm, prompt });
  try {
    const response = await chain.call({
      openAIApiKey: userApiKey,
      objective,
      task,
      notes,
      chunk,
    });
    return response.text;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return null;
    }
    console.log('error: ', error);
    return 'Failed to extract relevant information.';
  }
};

const relevantInfoExtractionPrompt = () => {
  const systemTemplate = `Objective: {objective}\nCurrent Task:{task}`;
  const relevantInfoExtractionTemplate = `Analyze the following text and extract information relevant to our objective and current task, and only information relevant to our objective and current task. If there is no relevant information do not say that there is no relevant informaiton related to our objective. ### Then, update or start our notes provided here (keep blank if currently blank): {notes}.### Text to analyze: {chunk}.### Updated Notes:`;
  const prompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(systemTemplate),
    HumanMessagePromptTemplate.fromTemplate(relevantInfoExtractionTemplate),
  ]);

  prompt.inputVariables = ['objective', 'task', 'notes', 'chunk'];

  return prompt;
};
