import { FC } from 'react';
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

  return (
    <Collapsible.Root className="w-full" open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <button className="inline-flex w-80 items-center justify-between rounded  bg-neutral-300 p-3 dark:bg-neutral-700">
          {title}
          {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
      </Collapsible.Trigger>
      <Collapsible.Content className="w-full p-4">
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
