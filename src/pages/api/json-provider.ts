import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { file } = req.query;

  const filePath = path.resolve('./data/example_objectives', `${file}.json`);
  const fileContents = fs.readFileSync(filePath, 'utf8');

  res.status(200).json(JSON.parse(fileContents));
}
