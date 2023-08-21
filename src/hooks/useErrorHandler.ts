import va from '@vercel/analytics';
import { toast } from 'sonner';

export const useErrorHandler = () => {
  const errorHandler = (error: Error) => {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown Error';
    toast.error(errorMessage);
    va.track('Error', { error: errorMessage });
  };

  return { errorHandler };
};
