import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';
import * as LabelPrimitive from '@radix-ui/react-label';
import React, { FC } from 'react';

interface CheckboxProps {
  label: string;
  caption?: string;
  checked: boolean;
  onChecked: (checked: boolean) => void;
}

const Checkbox: FC<CheckboxProps> = ({
  label,
  caption,
  checked,
  onChecked,
}) => {
  return (
    <form className="flex w-full items-start rounded-lg py-2">
      <CheckboxPrimitive.Root
        id="c1"
        className={
          'flex h-5 w-5 items-center justify-center rounded bg-gray-200 focus:outline-none dark:bg-neutral-900'
        }
        checked={checked}
        onCheckedChange={onChecked}
      >
        <CheckboxPrimitive.Indicator>
          <CheckIcon className="h-4 w-4 self-center text-black dark:text-white" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      <LabelPrimitive.Label
        htmlFor="c1"
        className="ml-3 select-none text-sm text-neutral-600 dark:text-white"
      >
        {label}
        <span className="ml-2 text-neutral-400">{caption}</span>
      </LabelPrimitive.Label>
    </form>
  );
};

export { Checkbox };
