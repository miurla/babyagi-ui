import Multion from '@/libs/multion/main.mjs';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { query, url } = req.body;

  const multion = new Multion(
    process.env.MULTION_CLIENT_ID,
    process.env.MULTION_CLIENT_SECRET,
  );
  const h = await multion.login(); // Wait for login to complete

  try {
    const response = await multion.newSession({ input: query, url });
    const { tabId, message, status } = response;
    return res.status(200).json({ message });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

export default handler;
