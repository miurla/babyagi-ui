import { PromptTemplate } from 'langchain/prompts';
import { LLMChain, LLMChainInput } from 'langchain/chains';

export class TaskSummarizeChain extends LLMChain {
  static fromLLM(fields: Omit<LLMChainInput, 'prompt'>): LLMChain {
    const taskSummarizeTemplate =
      `Please summarize the following text:` + ` {text}` + ` Summary:`;
    const prompt = new PromptTemplate({
      template: taskSummarizeTemplate,
      inputVariables: ['text'],
    });
    return new TaskSummarizeChain({ prompt, ...fields });
  }
}
