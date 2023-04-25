import type { NextApiRequest, NextApiResponse } from 'next';
import { startAgent } from '@/lib/babyagi';
import { UserSettings } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { objective, model, iterations, firstTask, userSettings } = req.body;
  const settings: UserSettings | undefined =
    process.env.NEXT_PUBLIC_USE_ENV_VALUES === 'true'
      ? undefined
      : userSettings;
  let clientDisconnected = false;

  res.on('close', () => {
    console.log('Client disconnected');
    clientDisconnected = true;
  });

  const stopSignal = () => clientDisconnected;

  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const outputCallback = (output: string) => {
      const escapedOutput = output.replace(/\n/g, '\\n');
      res.write(`data: ${escapedOutput}\n\n`);
    };

    await startAgent(
      objective as string,
      firstTask as string,
      model as string,
      Number(iterations),
      settings,
      outputCallback,
      stopSignal,
    );

    res.end();
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

export default handler;
