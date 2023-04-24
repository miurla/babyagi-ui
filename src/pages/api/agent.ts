import type { NextApiRequest, NextApiResponse } from 'next';
import { startAgent } from '@/lib/babyagi';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { objective, model, iterations, firstTask } = req.body;

  let clientDisconnected = false;

  res.on('close', () => {
    clientDisconnected = true;
    console.log('Client disconnected');
  });

  const stopSignal = () => clientDisconnected;

  try {
    res.setHeader('Content-Type', 'text/event-stream;charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
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
