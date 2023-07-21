import { FC } from 'react';
import * as HoverCard from '@radix-ui/react-hover-card';
import clsx from 'clsx';
import { SkillInfo } from '@/types';

export interface SkillProps {
  skill: SkillInfo;
}

export const SkillCard: FC<SkillProps> = ({ skill }) => {
  const name = skill.name
    .split('_')
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
  const badge =
    skill.badge === 'normal' ? undefined : skill.badge?.toUpperCase();

  return (
    <HoverCard.Root openDelay={300}>
      <HoverCard.Trigger>
        <div className="flex w-full cursor-default items-center gap-2 px-2 py-1 text-xs text-neutral-600 dark:text-white">
          <div className="flex items-center gap-3">
            <span className="text-base">{skill.icon}</span>
            <span>{name}</span>
          </div>
          {badge && (
            <span className="select-none rounded-full bg-red-500 bg-opacity-10 px-2 py-0.5 text-[10px] text-red-500 dark:bg-red-500 dark:bg-opacity-10 dark:text-red-300">
              {badge}
            </span>
          )}
        </div>
      </HoverCard.Trigger>
      <HoverCard.Content
        align="start"
        side="right"
        className={clsx(
          ' z-30  max-w-lg rounded p-2',
          'bg-neutral-100 dark:bg-neutral-800',
        )}
      >
        <HoverCard.Arrow className=" fill-neutral-100  dark:fill-neutral-800" />
        <div className="flex h-full w-full space-x-4 font-sans text-neutral-800 dark:text-neutral-300">
          <div>{skill.description}</div>
        </div>
      </HoverCard.Content>
    </HoverCard.Root>
  );
};
