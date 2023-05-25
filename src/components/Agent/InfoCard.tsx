import * as HoverCard from '@radix-ui/react-hover-card';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import clsx from 'clsx';

export interface HoverCardProps {
  children?: React.ReactNode;
  alert?: boolean;
}

export const InfoCard: React.FC<HoverCardProps> = ({ children, alert }) => {
  return (
    <HoverCard.Root openDelay={300}>
      <HoverCard.Trigger>
        <div
          className={clsx(
            'inline-flex cursor-pointer items-center justify-center rounded p-1',
          )}
        >
          <InfoCircledIcon
            className={clsx(
              'h-3 w-3',
              !alert && 'text-neutral-400 dark:text-neutral-600',
              alert && 'text-red-500 dark:text-red-600',
            )}
          />
        </div>
      </HoverCard.Trigger>
      <HoverCard.Content
        align="start"
        sideOffset={4}
        className={clsx(
          'z-30 w-72 rounded p-2',
          'bg-neutral-50 dark:bg-neutral-800',
        )}
      >
        <HoverCard.Arrow className="fill-current text-neutral-50 dark:text-neutral-800" />
        <div className="flex h-full w-full space-x-4">
          <div>{children}</div>
        </div>
      </HoverCard.Content>
    </HoverCard.Root>
  );
};
