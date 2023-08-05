import type { NextRequest } from 'next/server';
import { NextApiResponse } from 'next';
import { LangChainStream, StreamingTextResponse } from 'ai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanChatMessage } from 'langchain/schema';
import { AgentStream } from '@/agents/base/AgentStream';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest, res: NextApiResponse) {
  const { stream, handlers, func } = AgentStream();
  const { input, id } = await req.json();

  const llm = new ChatOpenAI({
    streaming: true,
    verbose: true,
  });

  // llm.call([new HumanChatMessage(input)], {}, [handlers]).catch(console.error);

  func();

  return new StreamingTextResponse(stream);
}
