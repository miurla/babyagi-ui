import { SelectItem } from '@/types';
import { FC } from 'react';
import { translate } from '../../utils/translate';

interface AgentMessageHeaderProps {
  model: SelectItem;
  agent: SelectItem;
}

export const AgentMessageHeader: FC<AgentMessageHeaderProps> = ({
  model,
  agent,
}) => {
  return (
    <div className="flex justify-center border border-b-neutral-300 bg-neutral-100 py-4 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-transparent dark:text-neutral-200">
      {`${translate('MODEL')}: ${model.name} | ${translate('AGENT')}: ${
        agent.name
      } ${agent.icon}`}
    </div>
  );
};
