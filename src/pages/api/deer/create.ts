import { taskCreationPrompt } from '@/agents/babydeeragi/agents/taskCreation/prompt';
import { LLMChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const handler = async (req: NextRequest) => {
  try {
    const { objective, websearch_var, user_input_var, model_name, language } =
      await req.json();

    const llm = new ChatOpenAI({
      modelName: model_name,
      temperature: 0,
      maxTokens: 1500,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    });

    const prompt = taskCreationPrompt();
    const chain = new LLMChain({ llm, prompt });
    const response = await chain.call({
      objective,
      websearch_var,
      user_input_var,
      language,
    });
    return NextResponse.json({ response: response.text });
  } catch (error) {
    return NextResponse.error();
  }
};

export default handler;
