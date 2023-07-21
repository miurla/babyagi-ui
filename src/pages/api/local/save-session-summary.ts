import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== 'development') {
    res.status(403).json({ error: 'Access is forbidden in this environment' });
    return;
  }

  if (req.method === 'POST') {
    const text = req.body.text;
    const date = new Date().toISOString().replace(/[:.]/g, '-'); // Get current date and time in YYYY-MM-DDTHH-MM-SS-SSS format
    const filePath = path.join(
      process.cwd(),
      'data',
      'output',
      `result_${date}.txt`,
    );

    fs.mkdir(path.dirname(filePath), { recursive: true }, (err) => {
      if (err) {
        res.status(500).json({ error: 'Failed to create directory' });
        return;
      } else {
        fs.writeFile(filePath, text, (err) => {
          if (err) {
            res.status(500).json({ error: 'Failed to write file' });
          } else {
            res.status(200).json({ message: 'File saved successfully' });
          }
        });
      }
    });
  } else {
    res.status(405).json({ error: 'Only POST method is allowed' });
  }
}
