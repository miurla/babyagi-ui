import { FC } from 'react';
import { SkillCard } from './SkillCard';
import { SkillInfo } from '@/types';
import { translate } from '@/utils/translate';

export interface SkillsListProps {
  skills: SkillInfo[];
}

export const SkillsList: FC<SkillsListProps> = ({ skills }) => {
  const sortedSkills = skills.sort((a, b) => {
    if (a.name > b.name) {
      return 1;
    }
    return -1;
  });
  return (
    <div className="mx-auto flex w-full flex-col gap-1 p-4 lg:w-2/3 xl:w-1/2">
      <div className="flex gap-1 text-xs text-neutral-400 dark:text-neutral-500">
        <span>{translate('AVAILABLE_SKILLS')}</span>
        <span>{`(${skills.length})`}</span>
      </div>
      <div className="flex max-h-24 w-full flex-col items-start gap-2 overflow-auto rounded-lg border bg-white p-2 font-mono text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-600">
        {sortedSkills.map((skill, index) => (
          <SkillCard
            key={index}
            skill={{
              name: skill.name,
              description: skill.description,
              icon: skill.icon,
              badge: skill.badge,
            }}
          />
        ))}
      </div>
    </div>
  );
};
