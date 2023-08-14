import va from '@vercel/analytics';
import { toast } from 'sonner';

export const useErrorHandler = () => {
  const errorHandler = (error: Event | ErrorEvent) => {
    const errorMessage =
      error instanceof ErrorEvent ? error.message : 'Unknown Error';
    toast.error(errorMessage);
    va.track('Error', { error: errorMessage });
  };

  return { errorHandler };
};
