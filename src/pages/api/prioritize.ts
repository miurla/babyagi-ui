import { NextRequest, NextResponse } from 'next/server';
import { prioritizationAgent } from '@/agents/babyagi/service';

export const config = {
  runtime: 'edge',
};

const handler = async (req: NextRequest) => {
  try {
    const { objective, task_names, task_id, model_name } = await req.json();
    const response = await prioritizationAgent(
      objective,
      task_id,
      task_names,
      model_name,
    );
    return NextResponse.json({ response: response });
  } catch (error) {
    return NextResponse.error();
  }
};

export default handler;
