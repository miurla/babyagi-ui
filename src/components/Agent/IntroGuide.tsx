import { translate } from '@/utils/translate';
import { FC } from 'react';

export interface IntroGuideProps {
  onClick: (value: string) => void;
  agent: string;
}

export const IntroGuide: FC<IntroGuideProps> = ({ onClick, agent }) => {
  const deerExamples = [
    translate('EXAMPLE_OBJECTIVE_1', 'constants'),
    translate('EXAMPLE_OBJECTIVE_2', 'constants'),
    translate('EXAMPLE_OBJECTIVE_3', 'constants'),
  ];
  const elfExample = [
    `${translate(
      'EXAMPLE_OBJECTIVE_6',
      'constants',
    )}: http://www.paulgraham.com/greatwork.html`,
    translate('EXAMPLE_OBJECTIVE_4', 'constants'),
    translate('EXAMPLE_OBJECTIVE_1', 'constants'),
  ];
  const elfDevExample = [
    translate('EXAMPLE_OBJECTIVE_4', 'constants'),
    translate('EXAMPLE_OBJECTIVE_5', 'constants'),
    translate('EXAMPLE_OBJECTIVE_2', 'constants'),
  ];
  const examples =
    agent === 'babydeeragi'
      ? deerExamples
      : process.env.NODE_ENV === 'development'
      ? elfDevExample
      : elfExample;

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
