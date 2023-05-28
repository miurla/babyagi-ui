import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';

export const relevantInfoExtractionPrompt = () => {
  const systemTemplate = `Objective: {objective}\nCurrent Task:{task}`;
  const relevantInfoExtractionTemplate = `Analyze the following text and extract information relevant to our objective and current task, and only information relevant to our objective and current task. If there is no relevant information do not say that there is no relevant informaiton related to our objective. ### Then, update or start our notes provided here (keep blank if currently blank): {notes}.### Text to analyze: {chunk}.### Updated Notes:`;
  const prompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(systemTemplate),
    HumanMessagePromptTemplate.fromTemplate(relevantInfoExtractionTemplate),
  ]);

  prompt.inputVariables = ['objective', 'task', 'notes', 'chunk'];

  return prompt;
};
