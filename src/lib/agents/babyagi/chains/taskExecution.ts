import { PromptTemplate } from 'langchain/prompts';
import { LLMChain, LLMChainInput } from 'langchain/chains';

export class TaskExecutionChain extends LLMChain {
  static fromLLM(fields: Omit<LLMChainInput, 'prompt'>): LLMChain {
    const executionTemplate =
      `You are an AI who performs one task based on the following objective: ` +
      `{objective}.` +
      `Take into account these previously completed tasks: {context}.` +
      ` Your task: {task}. Response:`;
    const prompt = new PromptTemplate({
      template: executionTemplate,
      inputVariables: ['objective', 'context', 'task'],
    });
    return new TaskExecutionChain({ prompt, ...fields });
  }
}
