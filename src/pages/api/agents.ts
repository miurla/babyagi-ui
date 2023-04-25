import type { NextApiRequest, NextApiResponse } from 'next';
import { startAgent } from '@/lib/babyagi';
import { UserSettings } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const handler = async (req: NextRequest, res: NextResponse) => {
  req.signal.addEventListener('abort', () => {
    console.log('Client disconnected');
  });

  req.signal.onabort = () => {
    console.log('Client disconnected');
  };

  let clientDisconnected = false;
  const stopSignal = () => clientDisconnected;

  const outputCallback = (output: string) => {
    const escapedOutput = output.replace(/\n/g, '\\n');
    // res.write(`data: ${escapedOutput}\n\n`);
  };

  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log('end');

  return new Response('Hello world!', {
    headers: {
      'content-type': 'text/plain',
    },
  });
};

export default handler;
