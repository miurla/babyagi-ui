import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== 'development') {
    res.status(403).json({ error: 'Access is forbidden in this environment' });
    return;
  }

  if (req.method === 'POST') {
    const filePath = path.join(process.cwd(), req.body.filename);
    const content = req.body.content;

    console.log(`Writing file: ${filePath}`);
    console.log(`Content: ${content}`);

    fs.writeFile(filePath, content, 'utf8', (err) => {
      if (err) {
        res.status(500).json({ error: 'Failed to write file' });
      } else {
        res.status(200).json({ message: 'File written successfully' });
      }
    });
  } else {
    res.status(405).json({ error: 'Only POST method is allowed' });
  }
}
