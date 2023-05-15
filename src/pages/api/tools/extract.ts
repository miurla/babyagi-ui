import { extractRelevantInfoAgent } from '@/agents/babycatagi/service';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { objective, task, chunk, notes } = await req.body;

    const response = await extractRelevantInfoAgent(
      objective,
      task,
      chunk,
      notes,
    );

    return res.status(200).json({ response: response });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

export default handler;
