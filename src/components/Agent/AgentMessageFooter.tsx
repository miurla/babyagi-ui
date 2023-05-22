import { translate } from '@/utils/translate';
import { FC } from 'react';
import { ThumbsDown, ThumbsUp } from 'react-feather';

export const AgentMessageFooter: FC = () => {
  return (
    <div className="relative m-auto flex items-center justify-end gap-2  py-2 text-xs text-neutral-300 dark:text-neutral-600 md:max-w-2xl lg:max-w-2xl  xl:max-w-3xl">
      <ThumbsUp className="h-3 w-3" />
      <ThumbsDown className="h-3 w-3" />
      {translate('FEEDBACK_MESSAGE', 'constants')}
    </div>
  );
};
