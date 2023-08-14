// src/hooks/useResetAndDeselect.ts
import va from '@vercel/analytics';

export const useResetAndDeselect = (
  reset: Function,
  selectExecution: Function,
) => {
  const clearHandler = () => {
    reset();
    selectExecution(undefined);

    va.track('New');
  };

  return { clearHandler };
};
