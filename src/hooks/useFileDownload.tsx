// src/hooks/useFileDownload.ts
import va from '@vercel/analytics';

export const useFileDownload = () => {
  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob(['\uFEFF' + content], {
      type: 'text/plain;charset=utf-8',
    });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();

    va.track('Download');
  };

  return { downloadFile };
};
