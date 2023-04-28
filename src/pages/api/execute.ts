import { NextRequest, NextResponse } from 'next/server';
import { contextAgent, executionAgent } from '@/agents/babyagi/service';

export const config = {
  runtime: 'edge',
};

const handler = async (req: NextRequest) => {
  try {
    const { objective, task, table_name, model_name } = await req.json();

    const context = await contextAgent(objective, table_name, 5);
    const response = await executionAgent(objective, task, context, model_name);
    return NextResponse.json({ response: response });
  } catch (error) {
    return NextResponse.error();
  }
};

export default handler;
