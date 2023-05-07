import { NextRequest, NextResponse } from 'next/server';
import { overviewAgent } from '@/agents/babybeeagi/service';

export const config = {
  runtime: 'edge',
};

const handler = async (req: NextRequest) => {
  try {
    const { objective, session_summary, last_task_id, completed_tasks_text } =
      await req.json();
    const response = await overviewAgent(
      objective,
      session_summary,
      last_task_id,
      completed_tasks_text,
    );
    return NextResponse.json({ response: response });
  } catch (error) {
    return NextResponse.error();
  }
};

export default handler;
