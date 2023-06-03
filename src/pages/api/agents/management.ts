import { NextRequest, NextResponse } from 'next/server';
import { taskManagementAgent } from '@/agents/babybeeagi/service';

export const config = {
  runtime: 'edge',
};

const handler = async (req: NextRequest) => {
  try {
    const {
      minified_task_list,
      objective,
      result,
      websearch_var,
      model_name,
      language,
    } = await req.json();
    const response = await taskManagementAgent(
      minified_task_list,
      objective,
      result,
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
