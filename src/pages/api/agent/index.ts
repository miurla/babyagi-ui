import type { NextRequest } from 'next/server';
import { NextApiResponse } from 'next';
import { StreamingTextResponse } from 'ai';
import { AgentStream } from '@/agents/base/AgentStream';
import { BabyElfAGI } from '@/agents/elf/executer';
import { SPECIFIED_SKILLS } from '@/utils/constants';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest, res: NextApiResponse) {
  const { stream, handlers } = AgentStream();
  const { input, id, language, verbose, agent_id } = await req.json();

  const specifiedSkills = agent_id === 'babydeeragi' ? SPECIFIED_SKILLS : [];
  const executer = new BabyElfAGI(
    input,
    id,
    handlers,
    language || 'en',
    verbose,
    specifiedSkills,
  );
  executer.run();

  return new StreamingTextResponse(stream);
}
