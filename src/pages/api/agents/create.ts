import { taskCreationAgent } from '@/agents/babycatagi/service';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

const handler = async (req: NextRequest) => {
  try {
    const { objective, websearch_var, model_name, language } = await req.json();
    const response = await taskCreationAgent(
      objective,
      websearch_var,
      model_name,
      language,
    );
    return NextResponse.json({ response: response });
  } catch (error) {
    return NextResponse.error();
  }
};

export default handler;
