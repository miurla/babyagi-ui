// src/hooks/useNotifications.ts
import { toast } from 'sonner';
import { taskCompletedNotification } from '@/utils/notification';
import { translate } from '../utils/translate';

export const useNotifications = () => {
  const notifyTaskCompletion = (input: string) => {
    toast.success(translate('ALL_TASKS_COMPLETED_TOAST', 'agent'));
    taskCompletedNotification(input);
  };

  return { notifyTaskCompletion };
};
