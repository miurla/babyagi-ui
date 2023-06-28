import { FC } from 'react';

export interface IntroGuideProps {
  onClick: (value: string) => void;
}

export const IntroGuide: FC<IntroGuideProps> = ({ onClick }) => {
  const examples = [
    'Write a weather report for the next 3 days in Paris',
    'Research the gpt-3.5-turbo-0613 model',
    'Report the latest news in the user’s favorite category',
  ];

  return (
    <div className="flex w-full flex-col items-center gap-2 rounded border bg-neutral-50 p-6 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-600 md:w-1/2 ">
      <div className="mb-2 text-lg font-semibold text-neutral-400">
        Examples ✍️
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
