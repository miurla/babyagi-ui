import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { model_name, text } = await req.body;
    const embedding = new OpenAIEmbeddings({
      modelName: model_name,
    });

    const response = await embedding.embedQuery(text);

    return res.status(200).json({ response: response });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

export default handler;
