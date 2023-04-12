import { FC } from 'react';

export const ProjectTile: FC = () => {
  return (
    <div className="flex h-full select-none items-center justify-center gap-2 text-4xl font-semibold text-neutral-300 dark:text-neutral-500">
      BabyAGI{' '}
      <span className="rounded bg-blue-200 px-1 text-2xl text-blue-600">
        UI
      </span>
    </div>
  );
};
