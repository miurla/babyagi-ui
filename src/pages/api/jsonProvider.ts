// pages/api/provideJson.js
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { file } = req.query; // クエリパラメータからファイル名を取得します

  const filePath = path.resolve('./data/example_objectives', `${file}.json`); // ファイル名に基づいてJSONファイルのパスを指定します
  const fileContents = fs.readFileSync(filePath, 'utf8');

  res.status(200).json(JSON.parse(fileContents));
}
