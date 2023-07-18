import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== 'development') {
    res.status(403).json({ error: 'Access is forbidden in this environment' });
    return;
  }

  if (req.method === 'GET') {
    const filename = Array.isArray(req.query.filename)
      ? req.query.filename[0]
      : req.query.filename;
    if (!filename) {
      res.status(400).json({ error: 'Filename is required' });
      return;
    }

    const filePath = path.join(process.cwd(), '/', filename);

    console.log(`Reading file: ${filePath}`);

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json({ content: data });
      }
    });
  } else {
    res.status(405).json({ error: 'Only GET method is allowed' });
  }
}
