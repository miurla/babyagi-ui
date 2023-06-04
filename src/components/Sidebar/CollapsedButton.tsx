import { DoubleArrowLeftIcon } from '@radix-ui/react-icons';
import React, { FC } from 'react';

export interface CollapsedButtonProps {
  onClick: () => void;
  isWhite: boolean;
  isLeft?: boolean;
}

export const CollapsedButton: FC<CollapsedButtonProps> = ({
  onClick,
  isWhite,
  isLeft = true,
}) => {
  return (
    <button
      className={`p-3 hover:text-neutral-500 ${
        isWhite ? 'text-white' : 'text-black dark:text-neutral-200'
      }`}
      onClick={onClick}
    >
      <DoubleArrowLeftIcon className={`h-4 w-4 ${!isLeft && 'rotate-180'}`} />
    </button>
  );
};
