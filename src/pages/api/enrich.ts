import { NextRequest, NextResponse } from 'next/server';
import { enrichResult } from '@/agents/babyagi/service';

export const config = {
  runtime: 'edge',
};

const handler = async (req: NextRequest) => {
  try {
    const { task, result, index, namespace, vector_values } = await req.json();
    await enrichResult(task, result, index, namespace, vector_values);
    return NextResponse.json({ response: 'success' });
  } catch (error) {
    return NextResponse.error();
  }
};

export default handler;
