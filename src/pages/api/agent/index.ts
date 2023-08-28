import { NextRequest, NextResponse } from 'next/server';
import { StreamingTextResponse } from 'ai';
import { AgentStream } from '@/lib/agents/base/AgentStream';
import { BabyElfAGI } from '@/lib/agents/babyelfagi/executer';
import { SPECIFIED_SKILLS } from '@/utils/constants';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest, res: NextResponse) {
  const { stream, handlers, addObserver } = AgentStream();
  const requestData = await req.json();
  const { input, agent_id, model_name, language, verbose, user_key } =
    requestData;

  validateEnvironmentVariables();
  validateUserKey(user_key);

  const specifiedSkills = getSpecifiedSkills(agent_id);
  const abortController = setupAbortController(addObserver);
  const executer = new BabyElfAGI(
    input,
    model_name,
    handlers,
    language || 'en',
    verbose,
    specifiedSkills,
    user_key,
    abortController.signal,
  );
  executer.run();

  return new StreamingTextResponse(stream);
}

function validateEnvironmentVariables() {
  if (!process.env.BASE_URL) {
    throw new Error('You must set BASE_URL environment variable');
  }
}

function validateUserKey(user_key: string) {
  if (
    process.env.NEXT_PUBLIC_USE_USER_API_KEY === 'true' &&
    (user_key === undefined || user_key === null || !user_key.startsWith('sk-'))
  ) {
    throw new Error('Invalid user key');
  }
}

function getSpecifiedSkills(agent_id: string) {
  return agent_id === 'babydeeragi' ? SPECIFIED_SKILLS : [];
}

function setupAbortController(addObserver: Function) {
  const abortController = new AbortController();

  addObserver((isActive: boolean) => {
    if (!isActive) abortController.abort();
  });

  return abortController;
}
