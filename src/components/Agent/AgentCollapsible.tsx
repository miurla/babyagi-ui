import { FC, use, useEffect } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import React from 'react';

export interface AgentCollapsibleProps {
  children: React.ReactNode;
  title: string;
}

export const AgentCollapsible: FC<AgentCollapsibleProps> = ({
  children,
  title,
}) => {
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    setOpen(false);
  }, []);

  return (
    <Collapsible.Root className="w-full" open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <button className="inline-flex w-80 items-center justify-between rounded bg-neutral-200 p-3 text-sm dark:bg-neutral-900">
          {title}
          {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
      </Collapsible.Trigger>
      <Collapsible.Content className="w-full py-2">
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
