import type { NextRequest } from 'next/server';
import { NextApiResponse } from 'next';
import { LangChainStream, StreamingTextResponse } from 'ai';
import { AgentStream } from '@/agents/base/AgentStream';
import { BabyElfAGI } from '@/agents/elf/executer';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest, res: NextApiResponse) {
  const { stream, handlers } = AgentStream();
  const { input, id, language } = await req.json();

  // const llm = new ChatOpenAI({
  //   streaming: true,
  //   verbose: true,
  // });

  // llm.call([new HumanChatMessage(input)], {}, [handlers]).catch(console.error);

  const executer = new BabyElfAGI(input, id, handlers, language || 'en');
  executer.run();

  return new StreamingTextResponse(stream);
}
