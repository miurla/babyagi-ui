import { DotsHorizontalIcon, TrashIcon } from '@radix-ui/react-icons';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { on } from 'events';
import React, { FC } from 'react';
import { translate } from '../../utils/translate';

interface ExtraButtonProps {
  onDelete: () => void;
}

export const ExtraButton: FC<ExtraButtonProps> = ({ onDelete }) => {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete();
  };

  return (
    <div className="relative inline-block text-left">
      <PopoverPrimitive.Root>
        <PopoverPrimitive.Trigger asChild>
          <button className="p-1 text-neutral-400 opacity-0 hover:opacity-100">
            <DotsHorizontalIcon />
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Content
          align="center"
          sideOffset={4}
          className="z-50 w-48 rounded-lg bg-neutral-900 p-2 shadow-md"
        >
          <PopoverPrimitive.Arrow className="fill-current text-gray-900" />
          <button
            className="inline-flex h-full w-full items-center gap-2 rounded-md p-2 hover:bg-neutral-800"
            onClick={handleClick}
          >
            <TrashIcon className="h-5 w-5" />
            {translate('DELETE')}
          </button>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Root>
    </div>
  );
};
