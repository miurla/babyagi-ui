import { FC, useEffect } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import React from 'react';

export interface AgentCollapsibleProps {
  children: React.ReactNode;
  title: string;
  isOpen?: boolean;
}

export const AgentCollapsible: FC<AgentCollapsibleProps> = ({
  children,
  title,
  isOpen = true,
}) => {
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    setOpen(isOpen);
  }, []);

  return (
    <Collapsible.Root className="w-full" open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <button className="inline-flex w-80 items-center justify-between rounded bg-neutral-200 p-3 dark:bg-neutral-900">
          <span className="truncate pr-1 text-xs text-neutral-600 dark:text-neutral-400">
            {title}
          </span>
          {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
      </Collapsible.Trigger>
      <Collapsible.Content className="w-full py-2">
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
