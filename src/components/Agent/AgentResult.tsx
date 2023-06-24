import { FC, useEffect } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronRightIcon, Link1Icon } from '@radix-ui/react-icons';
import React from 'react';

export interface AgentResultProps {
  children: React.ReactNode;
  title: string;
  dependencies?: number[];
  isOpen?: boolean;
}

export const AgentResult: FC<AgentResultProps> = ({
  children,
  title,
  dependencies,
  isOpen = true,
}) => {
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    setOpen(isOpen);
  }, []);

  return (
    <Collapsible.Root className="w-full" open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <button
          className={`flex w-full items-center justify-between bg-neutral-50 px-6 py-2 text-sm text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400 ${
            !open && 'rounded-b-lg'
          }`}
        >
          <div className="flex items-center gap-2">
            <ChevronRightIcon className={`${open && 'rotate-90'}`} />
            <div className="">{title}</div>
          </div>
          {dependencies && dependencies.length > 0 && (
            <div className="flex items-center gap-2">
              <Link1Icon />
              <div className="">{dependencies.join(', ')}</div>
            </div>
          )}
        </button>
      </Collapsible.Trigger>
      <Collapsible.Content className="w-full py-2">
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
