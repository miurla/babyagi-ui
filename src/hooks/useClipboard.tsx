// src/hooks/useClipboard.ts
import { toast } from 'sonner';
import va from '@vercel/analytics';
import { translate } from '../utils/translate';

export const useClipboard = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(translate('COPIED_TO_CLIPBOARD', 'agent'));
    va.track('CopyToClipboard');
  };

  return { copyToClipboard };
};
