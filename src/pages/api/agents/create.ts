import { taskCreationAgent } from '@/agents/babycatagi/service';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { objective, websearch_var, model_name } = await req.body;

    const response = await taskCreationAgent(
      objective,
      websearch_var,
      model_name,
    );

    return res.status(200).json({ response: response });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

export default handler;
