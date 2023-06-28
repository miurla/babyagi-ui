import { translate } from '@/utils/translate';
import { FC } from 'react';

export interface IntroGuideProps {
  onClick: (value: string) => void;
}

export const IntroGuide: FC<IntroGuideProps> = ({ onClick }) => {
  const examples = [
    translate('EXAMPLE_OBJECTIVE_1', 'constants'),
    translate('EXAMPLE_OBJECTIVE_2', 'constants'),
    translate('EXAMPLE_OBJECTIVE_3', 'constants'),
  ];

  return (
    <div className="flex w-full flex-col items-center gap-2 rounded border bg-neutral-50 p-6 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-600 md:w-1/2 ">
      <div className="mb-2 text-lg font-semibold text-neutral-400">
        {translate('EXAMPLES', 'constants')} ✍️
      </div>
      {examples.map((example) => (
        <button
          className="p-2"
          key={example}
          onClick={(event) => {
            onClick(event.currentTarget.textContent || '');
          }}
        >
          {example}
        </button>
      ))}
    </div>
  );
};
