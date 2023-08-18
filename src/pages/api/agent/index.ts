import type { NextRequest } from 'next/server';
import { StreamingTextResponse } from 'ai';
import { AgentStream } from '@/agents/base/AgentStream';
import { BabyElfAGI } from '@/agents/babyelfagi/executer';
import { SPECIFIED_SKILLS } from '@/utils/constants';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const { stream, handlers, addObserver } = AgentStream();
  const { input, agent_id, model_name, language, verbose, user_key } =
    await req.json();

  if (
    process.env.NEXT_PUBLIC_USE_USER_API_KEY === 'true' &&
    (user_key === undefined || user_key === null || !user_key.startsWith('sk-'))
  ) {
    throw new Error('Invalid user key');
  }

  const specifiedSkills = agent_id === 'babydeeragi' ? SPECIFIED_SKILLS : [];

  // req.signal is not working, so we use AbortController.
  const abortController = new AbortController();
  const signal = abortController.signal;

  // Add an observer to abort the request when the client disconnects.
  addObserver((isActive) => {
    if (!isActive) abortController.abort();
  });

  const executer = new BabyElfAGI(
    input,
    model_name,
    handlers,
    language || 'en',
    verbose,
    specifiedSkills,
    user_key,
    signal,
  );
  executer.run();

  return new StreamingTextResponse(stream);
}
