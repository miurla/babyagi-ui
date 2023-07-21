import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

interface DirectoryNode {
  name: string;
  type: 'folder' | 'file';
  children: DirectoryNode[];
}

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (process.env.NODE_ENV !== 'development') {
    res.status(403).json({ error: 'Access is forbidden in this environment' });
    return;
  }

  if (req.method === 'GET') {
    const dirStructure = getAllFilePaths('src');
    res.status(200).json(dirStructure);
  } else {
    res.status(405).json({ error: 'Only GET method is allowed' });
  }
};

const getDirectoryStructure = (startPath: string): DirectoryNode => {
  const info: DirectoryNode = {
    name: path.basename(startPath),
    type: 'folder',
    children: [],
  };

  fs.readdirSync(startPath, { withFileTypes: true }).forEach((dirent) => {
    const ignoreDirs = ['node_modules', '.next', '.git']; // add any other directories to ignore here
    const ignoreFiles = ['.DS_Store']; // add any other files to ignore here
    if (dirent.isDirectory() && !ignoreDirs.includes(dirent.name)) {
      info.children.push(
        getDirectoryStructure(path.join(startPath, dirent.name)),
      );
    } else if (dirent.isFile() && !ignoreFiles.includes(dirent.name)) {
      info.children.push({ name: dirent.name, type: 'file', children: [] });
    }
  });

  return info;
};

const getAllFilePaths = (
  startPath: string,
  ignoreDirs: string[] = [],
): string[] => {
  const ignoreFiles = ['.DS_Store']; // add any other files to ignore here
  let filePaths: string[] = [];

  fs.readdirSync(startPath, { withFileTypes: true }).forEach((dirent) => {
    const fullPath = path.join(startPath, dirent.name);
    if (dirent.isDirectory() && !ignoreDirs.includes(dirent.name)) {
      filePaths = [...filePaths, ...getAllFilePaths(fullPath, ignoreDirs)];
    } else if (dirent.isFile() && !ignoreFiles.includes(dirent.name)) {
      filePaths.push(fullPath);
    }
  });

  return filePaths;
};

export default handler;
