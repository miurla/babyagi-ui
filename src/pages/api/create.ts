import { NextRequest, NextResponse } from 'next/server';
import { taskCreationAgent } from '@/agents/babyagi/service';

export const config = {
  runtime: 'edge',
};

const handler = async (req: NextRequest) => {
  try {
    const {
      result,
      task_description,
      incomplete_tasks,
      objective,
      model_name,
      language,
    } = await req.json();
    const response = await taskCreationAgent(
      objective,
      task_description,
      result,
      incomplete_tasks,
      model_name,
      language,
    );
    return NextResponse.json({ response: response });
  } catch (error) {
    return NextResponse.error();
  }
};

export default handler;
