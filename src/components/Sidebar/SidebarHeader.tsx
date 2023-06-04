import { useExecution } from '@/hooks/useExecution';
import { useExecutionStatus } from '@/hooks/useExecutionStatus';
import { PlusIcon } from '@radix-ui/react-icons';
import { FC } from 'react';
import { translate } from '../../utils/translate';
import { CollapsedButton } from './CollapsedButton';

interface SidebarHeaderProps {
  onMenuClick: () => void;
}

export const SidebarHeader: FC<SidebarHeaderProps> = ({ onMenuClick }) => {
  const { selectExecution } = useExecution();
  const { isExecuting } = useExecutionStatus();

  const handleClick = () => {
    selectExecution(undefined);
  };

  return (
    <header className="flex items-center border-b border-neutral-600 pb-4">
      <button
        className="flex w-[210px] items-center gap-3 rounded-md p-3 text-sm text-white transition-colors duration-200 hover:bg-neutral-500/10 disabled:opacity-50 sm:w-full"
        onClick={handleClick}
        disabled={isExecuting}
      >
        <PlusIcon />
        {translate('NEW_OBJECTIVE')}
      </button>
      <CollapsedButton onClick={onMenuClick} isWhite={true} />
    </header>
  );
};
