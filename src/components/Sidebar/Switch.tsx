import React, { FC } from 'react';
import * as SwitchPromitive from '@radix-ui/react-switch';

export interface SwitchProps {
  label: string;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch: FC<SwitchProps> = ({ label, checked, onCheckedChange }) => (
  <form>
    <div
      className="flex w-full justify-between rounded border p-2 dark:border-neutral-600"
      style={{ display: 'flex', alignItems: 'center' }}
    >
      <label
        className="text-sm text-black dark:text-gray-400"
        htmlFor="notification"
      >
        {label}
      </label>
      <SwitchPromitive.Root
        className="relative h-6 w-11 cursor-default rounded-full bg-neutral-300 outline-none data-[state=checked]:bg-black dark:bg-neutral-500 dark:data-[state=checked]:bg-neutral-700"
        id="notification"
        checked={checked}
        onCheckedChange={onCheckedChange}
      >
        <SwitchPromitive.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[21px]" />
      </SwitchPromitive.Root>
    </div>
  </form>
);

export default Switch;
