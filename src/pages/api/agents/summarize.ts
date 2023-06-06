import { NextRequest, NextResponse } from 'next/server';
import { summarizerAgent } from '@/agents/babybeeagi/service';

export const config = {
  runtime: 'edge',
};

const handler = async (req: NextRequest) => {
  try {
    const { text, language } = await req.json();
    const response = await summarizerAgent(text, language);
    return NextResponse.json({ response: response });
  } catch (error) {
    return NextResponse.error();
  }
};

export default handler;
