import React from 'react';
import remarkGfm from 'remark-gfm';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

interface MarkdownProps {
  content: string;
}

const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>;
};

export default Markdown;
