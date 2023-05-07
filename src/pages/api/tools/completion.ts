import { textCompletion } from '@/agents/babybeeagi/tools/textCompletion';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { prompt, model_name } = await req.body;

    const response = await textCompletion(prompt, model_name);
    return res.status(200).json({ response: response });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

export default handler;
