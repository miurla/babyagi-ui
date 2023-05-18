import { SelectItem } from '@/types';
import { FC } from 'react';
import { translate } from '../../utils/translate';

interface AgentMessageHeaderProps {
  model: SelectItem;
  iterations: SelectItem;
}

export const AgentMessageHeader: FC<AgentMessageHeaderProps> = ({
  model,
  iterations,
}) => {
  return (
    <div className="flex justify-center border border-b-neutral-300 bg-neutral-100 py-2 text-sm text-neutral-500 dark:border-none dark:bg-[#444654] dark:text-neutral-200">
      {`${translate('MODEL')}: ${model.name} | ${translate('ITERATION')}: ${
        iterations.name
      }`}
    </div>
  );
};
