import { PromptTemplate } from 'langchain/prompts';
import { LLMChain, LLMChainInput } from 'langchain/chains';

export class TaskSummarizeChain extends LLMChain {
  static fromLLM(fields: Omit<LLMChainInput, 'prompt'>): LLMChain {
    const taskSummarizeTemplate =
      'Please summarize the following text. If specific figures are available, they must be included.:\n{text}\nSummary:';
    const prompt = new PromptTemplate({
      template: taskSummarizeTemplate,
      inputVariables: ['text'],
    });
    return new TaskSummarizeChain({ prompt, ...fields });
  }
}
